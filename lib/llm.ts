"use server";

interface Suggestion {
    title: string;
    description: string;
    impact: "High" | "Medium" | "Low";
    savings: string;
}

export async function getSuggestions(appliances: Record<string, number>, season: string): Promise<Suggestion[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suggestions: Suggestion[] = [];

    // Appliance specific suggestions (Prioritized)
    if (appliances["AC"] && appliances["AC"] > 0) {
        if (appliances["AC"] > 1) {
            suggestions.push({
                title: "Consolidate Cooling",
                description: `You are running ${appliances["AC"]} AC units. Try to cool only one main room and gather the family there instead of cooling multiple empty rooms.`,
                impact: "High",
                savings: `Save ~${appliances["AC"] * 15}%`
            });
        } else {
            suggestions.push({
                title: "Optimize AC Temperature",
                description: "Since you have 1 AC, ensure it's running efficiently. Set it to 26°C. Every degree lower increases consumption by ~6%.",
                impact: "High",
                savings: "Save ~15-20%"
            });
        }

        suggestions.push({
            title: "AC Maintenance Routine",
            description: "Dirty filters restrict airflow and reduce efficiency. Cleaning your AC filters every 2 weeks can improve efficiency by up to 15%.",
            impact: "Medium",
            savings: "Save ~15%"
        });
    }

    if (appliances["Fan"] && appliances["Fan"] > 0) {
        if (appliances["Fan"] > 3) {
            suggestions.push({
                title: "Smart Fan Usage",
                description: `You have ${appliances["Fan"]} fans. Ensure fans are turned off in unoccupied rooms. They cool people, not rooms.`,
                impact: "Medium",
                savings: "Save ~5-10%"
            });
        }
        suggestions.push({
            title: "Fan & AC Combo",
            description: "Use ceiling fans alongside your AC. The wind chill effect allows you to set the AC thermostat 4°C higher with the same comfort.",
            impact: "Medium",
            savings: "Save ~10%"
        });
    }

    if (appliances["Refrigerator"] && appliances["Refrigerator"] > 0) {
        suggestions.push({
            title: "Refrigerator Efficiency",
            description: "Ensure your refrigerator door seals are tight and keep it away from heat sources like the oven or direct sunlight. A cool fridge works less hard.",
            impact: "Low",
            savings: "Save ~2-5%"
        });
    }

    if (appliances["Light Bulb"] && appliances["Light Bulb"] > 0) {
        if (appliances["Light Bulb"] > 10) {
            suggestions.push({
                title: "Massive Lighting Savings",
                description: `You have ${appliances["Light Bulb"]} light bulbs. Replacing all incandescent or CFL bulbs with LEDs is a quick win that pays off in months.`,
                impact: "Medium",
                savings: "Save ~80% on lighting"
            });
        } else if (appliances["Light Bulb"] > 5) {
            suggestions.push({
                title: "LED Upgrade",
                description: "Consider upgrading your most frequently used lights to LEDs.",
                impact: "Low",
                savings: "Save ~50% on lighting"
            });
        }
    }

    // General suggestions based on season (Secondary)
    if (season === "Summer") {
        // Only add if we haven't already added a specific AC suggestion that covers this
        if (!appliances["AC"] || appliances["AC"] === 0) {
            suggestions.push({
                title: "Keep Heat Out",
                description: "Keep blinds and curtains closed during the hottest part of the day to prevent your home from heating up.",
                impact: "Medium",
                savings: "Save ~10-15%"
            });
        }
    } else if (season === "Winter") {
        suggestions.push({
            title: "Maximize Natural Heat",
            description: "Open curtains during the day to let sunlight naturally heat your home, and close them at night to retain that heat.",
            impact: "Medium",
            savings: "Save ~5-10%"
        });
    }

    // Fallback if few suggestions
    if (suggestions.length < 2) {
        suggestions.push({
            title: "Eliminate Phantom Load",
            description: "Many electronics consume power even when turned off. Unplug chargers, TVs, and computers when not in use to stop this 'vampire' energy drain.",
            impact: "Low",
            savings: "Save ~5-10%"
        });
    }

    return suggestions;
}
