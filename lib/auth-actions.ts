'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface AuthResult {
    success: boolean
    message: string
}

export async function signUp(formData: FormData): Promise<AuthResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const accountNumber = formData.get('accountNumber') as string

    // Validate account number is exactly 13 digits
    if (!/^\d{13}$/.test(accountNumber)) {
        return { success: false, message: 'Account number must be exactly 13 digits.' }
    }

    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' }
    }

    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' }
    }

    const supabase = await createServerSupabaseClient()

    // Get the origin for the redirect URL
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                account_number: accountNumber,
            },
        },
    })

    if (error) {
        return { success: false, message: error.message }
    }

    if (!data.user) {
        return { success: false, message: 'Registration failed. Please try again.' }
    }

    // Insert user profile into users_profile table
    const { error: profileError } = await supabase
        .from('users_profile')
        .insert({
            id: data.user.id,
            email: email,
            ke_account_number: accountNumber,
        })

    if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't fail registration if profile insert fails - it can be retried
    }

    // Trigger bill scraping and extraction in the background
    triggerBillProcessing(accountNumber, data.user.id).catch(err => {
        console.error('Background bill processing error:', err)
    })

    return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
    }
}

export async function signIn(formData: FormData): Promise<AuthResult> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' }
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { success: false, message: error.message }
    }

    redirect('/dashboard')
}

export async function signOut() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get profile data
    const { data: profile } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        id: user.id,
        email: user.email,
        accountNumber: profile?.ke_account_number || null,
        emailVerified: !!user.email_confirmed_at,
    }
}

// Trigger bill scraping and extraction, then store in Supabase
export async function triggerBillProcessing(accountNumber: string, userId: string) {
    try {
        const backendDir = path.join(process.cwd(), 'backend')
        const scraperPath = path.join(backendDir, 'scraper.js')
        const extractorPath = path.join(backendDir, 'extractor.js')

        // Step 1: Run scraper to fetch bills locally
        console.log(`🔄 Starting bill scraping for account: ${accountNumber}`)
        try {
            const { stdout, stderr } = await execAsync(
                `node "${scraperPath}" "${accountNumber}"`,
                { cwd: backendDir, timeout: 300000 }
            )
            console.log('Scraper output:', stdout)
            if (stderr) console.error('Scraper stderr:', stderr)
        } catch (err: any) {
            console.error('Scraper error:', err.message)
            // Continue to try extraction even if scraper had issues
        }

        // Step 2: Run extractor to get units and price
        console.log(`🔍 Starting data extraction for account: ${accountNumber}`)
        try {
            const { stdout, stderr } = await execAsync(
                `node "${extractorPath}" "${accountNumber}"`,
                { cwd: backendDir, timeout: 120000 }
            )
            console.log('Extractor output:', stdout)
            if (stderr) console.error('Extractor stderr:', stderr)
        } catch (err: any) {
            console.error('Extractor error:', err.message)
            return
        }

        // Step 3: Read extracted data from CSV and store in Supabase
        const fs = await import('fs')
        const Papa = await import('papaparse')
        const csvPath = path.join(process.cwd(), 'public', 'data.csv')

        // Small delay to ensure Windows has finished closing the file handle
        await new Promise(r => setTimeout(r, 500))

        if (!fs.existsSync(csvPath)) {
            console.error('❌ CSV file not found at:', csvPath)
            return
        }

        const fileContent = fs.readFileSync(csvPath, 'utf8')
        console.log(`📄 CSV Content length: ${fileContent.length} bytes`)
        
        const parseResult = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => header.trim(),
        })

        const allRows = parseResult.data as any[]
        console.log(`Total rows in CSV: ${allRows.length}`)
        
        const rows = allRows.filter(
            (row: any) => row.accountNumber?.trim() === accountNumber
        )

        if (rows.length === 0) {
            console.log(`⚠️ No rows matching account ${accountNumber} found in CSV.`)
            console.log('Sample row from CSV:', allRows[0] || 'NONE')
            return
        }

        console.log(`✅ Found ${rows.length} rows for account ${accountNumber}. Syncing to Supabase...`)

        // Store in Supabase electricity_bills table
        const supabase = await createServerSupabaseClient()

        // Remove existing bills for ONLY this account to avoid duplicates
        await supabase
            .from('electricity_bills')
            .delete()
            .eq('user_id', userId)
            .eq('ke_account_number', accountNumber)

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentDate = new Date();
        const currentMonthIndex = currentDate.getMonth();

        console.log(`📊 Processing ${rows.length} rows for Supabase insertion...`)

        const billRecords = rows.map((row: any, index: number) => {
            const offsetFromEnd = rows.length - 1 - index;
            let targetMonthIndex = currentMonthIndex - offsetFromEnd;
            while (targetMonthIndex < 0) targetMonthIndex += 12;

            return {
                user_id: userId,
                ke_account_number: accountNumber,
                units_consumed: parseFloat(row.currentMonthUnits) || 0,
                bill_amount: parseFloat((row.currentMonthPrice || '0').replace(/,/g, '')) || 0,
                billing_month: months[targetMonthIndex],
            }
        })

        const { error } = await supabase
            .from('electricity_bills')
            .insert(billRecords)

        if (error) {
            console.error('❌ Failed to insert bills into Supabase:', error.message, error.details, error.hint)
        } else {
            console.log(`✅ SUCCESS: Stored ${billRecords.length} bills in Supabase for user ${userId} / account ${accountNumber}`)
        }
    } catch (err: any) {
        console.error('❌ Bill processing error:', err)
    }
}

// Manually trigger re-scraping for a user
export async function rescrapeUserBills(): Promise<AuthResult> {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'Not authenticated' }
    }

    const { data: profile } = await supabase
        .from('users_profile')
        .select('ke_account_number')
        .eq('id', user.id)
        .single()

    if (!profile?.ke_account_number) {
        return { success: false, message: 'No account number found' }
    }

    await triggerBillProcessing(profile.ke_account_number, user.id)

    return { success: true, message: 'Bills have been refreshed!' }
}

// Get user's bills from Supabase
export async function getUserBills() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: bills, error } = await supabase
        .from('electricity_bills')
        .select('*')
        .eq('user_id', user.id)
        .order('billing_month', { ascending: true }) // Using billing_month or created_at

    if (error) {
        console.error('Error fetching bills:', error)
        return null
    }

    return bills
}
