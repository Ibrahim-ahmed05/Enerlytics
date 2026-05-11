"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
    user: User | null
    loading: boolean
    accountNumber: string | null
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    accountNumber: null,
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [accountNumber, setAccountNumber] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                // Fetch profile for account number
                const { data: profile } = await supabase
                    .from("users_profile")
                    .select("ke_account_number")
                    .eq("id", user.id)
                    .single()

                setAccountNumber(profile?.ke_account_number || null)
            }

            setLoading(false)
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from("users_profile")
                        .select("ke_account_number")
                        .eq("id", session.user.id)
                        .single()

                    setAccountNumber(profile?.ke_account_number || null)
                } else {
                    setAccountNumber(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, accountNumber }}>
            {children}
        </AuthContext.Provider>
    )
}
