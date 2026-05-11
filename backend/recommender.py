import math
from datetime import datetime

# =============================================================================
# DATA & CONSTANTS (WITH REFERENCES)
# =============================================================================

# K-Electric Residential Tariff Structure
# Reference: K-Electric Official Tariff Schedule (2024-2025)
# Note: Prices are approximate 'variable energy charges' per kWh.
# Slabs are defined by NEPRA (National Electric Power Regulatory Authority).
SLAB_THRESHOLDS = [
    {"limit": 100, "base_price": 16.48, "label": "Slab 1"},
    {"limit": 200, "base_price": 22.95, "label": "Slab 2"},
    {"limit": 300, "base_price": 27.14, "label": "Slab 3"},
    {"limit": 700, "base_price": 38.46, "label": "Slab 4"},
    {"limit": float('inf'), "base_price": 47.20, "label": "Slab 5"}
]

# Peak Hour Window
# User Report Reference: 17:00 to 23:00 (5:00 PM to 11:00 PM)
# Note: K-Electric standard peak hours typically vary by season (e.g., 6:30 PM - 10:30 PM in summer),
# but this engine adheres to the 17:00-23:00 window as specified in the project requirements.
PEAK_HOURS_START = 17
PEAK_HOURS_END = 23

# Appliance Wattage Reference
# Reference: "Standard Appliance Energy Consumption Guide" (Energy Efficiency literature)
# and typical manufacturer specifications for the Pakistani market.
APPLIANCE_WATTAGE = {
    "Split AC (1.5 ton)": 1500, # 1.5 kWh per hour of compressor run
    "Split AC (1 ton)": 1000,   # 1.0 kWh per hour
    "Geyser": 2000,            # 2.0 kWh per hour
    "Washing Machine": 500,     # 0.5 kWh per hour
    "Refrigerator": 150,        # 0.15 kWh per hour (Avg. cycle)
    "Iron": 1000,               # 1.0 kWh per hour
    "LED Lighting": 100,        # 0.1 kWh per hour (Whole home avg)
    "Microwave": 1200           # 1.2 kWh per hour
}

# =============================================================================
# RECOMMENDATION ENGINE
# =============================================================================

def generate_recommendations(projected_units, remaining_days):
    """
    Rule-based system to generate prioritized energy-saving recommendations.
    Reference: Logic based on NEPRA Slab-wise billing and Peak/Off-Peak rate differences.
    """
    # 1. Determine the target slab boundary to stay within
    # We aim for the nearest threshold below the current projection.
    target_threshold = 700
    for t in [100, 200, 300, 700]:
        if projected_units <= t + 10: # If within 10 units or already crossed
            target_threshold = t
            break
            
    units_to_save = max(0, projected_units - target_threshold)
    daily_reduction_required = units_to_save / max(1, remaining_days)
    
    recommendations = []
    
    # Priority 1: High Impact Reduction (Air Conditioning)
    # AC usage reduction has the highest impact on slab maintenance.
    if projected_units > 100:
        total_ac_saved = 1.5 * remaining_days # assuming 1 hour daily reduction
        recommendations.append({
            "priority": 1,
            "title": "Reduce air conditioner usage by 1 hour per day during peak hours",
            "description": f"Targeting the {PEAK_HOURS_START}:00-{PEAK_HOURS_END}:00 window reduces consumption when grid demand and rates are highest.",
            "impact": "High",
            "units_saved": round(total_ac_saved, 1),
            "financial_saving": f"Rs {round(total_ac_saved * 28)}-{round(total_ac_saved * 42)}",
            "action": "Reduce"
        })

    # Priority 2: Peak-to-Off-Peak Shifting (Washing Machine)
    # Reference: Rate shifting principle (shifting loads to lower-cost windows).
    recommendations.append({
        "priority": 2,
        "title": "Shift washing machine use from evening to morning (before 14:00)",
        "description": "Operating heavy motors during morning hours reduces peak load and can prevent entering higher price tiers.",
        "impact": "Medium",
        "units_saved": 0,
        "financial_saving": "Rs 80-120 (Estimated Rate Saving)",
        "action": "Shift"
    })

    # Priority 3: Water Heating Optimization (Geyser)
    # Geysers are one of the highest wattage household appliances (2000W+).
    if projected_units > 200:
        geyser_saved = 1.0 * remaining_days # assuming 30 mins reduction (1.0 kWh saved)
        recommendations.append({
            "priority": 3,
            "title": "Reduce geyser heating duration by 30 minutes per day",
            "description": "Reducing active heating cycles significantly lowers the baseline consumption for the remaining billing days.",
            "impact": "Medium",
            "units_saved": round(geyser_saved, 1),
            "financial_saving": f"Rs {round(geyser_saved * 25)}-{round(geyser_saved * 35)}",
            "action": "Reduce"
        })

    # Priority 4: Peak Window Avoidance (Ironing)
    recommendations.append({
        "priority": 4,
        "title": "Avoid iron use during peak hours",
        "description": "Irons use ~1000W. Avoiding use during high-rate windows (5 PM - 11 PM) minimizes billing 'penalties'.",
        "impact": "Low",
        "units_saved": 2, # nominal saving for shift
        "financial_saving": "Rs 30-60",
        "action": "Shift"
    })

    return recommendations
