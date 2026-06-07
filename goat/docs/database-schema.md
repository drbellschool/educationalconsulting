# Goat Operations Database Schema

This schema is the production target for Goat Bot. The current static dashboard can use localStorage for MVP data, but the tables below should become the real datastore in Google Sheets, SQLite, Postgres, or Supabase.

## Core tables

### pens
- id
- pen_code
- name
- stage_type
- max_goats
- current_goat_count
- last_cleaned_at
- next_cleaning_due
- notes

### batches
- id
- batch_code
- purchase_date
- source_market
- source_seller
- planned_head_count
- actual_head_count
- status
- quality_assumption
- intake_pen_id
- current_stage
- target_sale_date
- actual_sale_date
- total_purchase_cost
- total_feed_cost
- total_med_cost
- total_other_cost
- projected_floor_profit
- projected_target_profit
- projected_upside_bonus
- actual_revenue
- actual_net_profit
- notes

### goats
- id
- tag_id
- batch_id
- source
- purchase_date
- purchase_price
- intake_weight
- current_weight
- sex
- quality_assumption
- current_quality_score
- likely_sale_quality
- current_pen_id
- next_weigh_date
- next_exam_date
- medication_status
- withdrawal_status
- withdrawal_end_date
- projected_floor_profit
- projected_target_profit
- projected_upside_bonus
- actual_sale_result
- actual_net_profit
- notes

### pen_movements
- id
- goat_id
- batch_id
- from_pen_id
- to_pen_id
- movement_date
- movement_reason
- moved_by
- notes

### weight_logs
- id
- goat_id
- batch_id
- weight_date
- weight
- avg_daily_gain_since_last
- weighed_by
- notes

### health_exams
- id
- goat_id
- exam_date
- famacha_score
- body_condition_score
- appetite
- stool_notes
- respiratory_notes
- hoof_notes
- temperature
- injury_notes
- overall_status
- follow_up_date
- notes

### medicine_logs
- id
- goat_id
- medicine_name
- dose
- route
- reason
- date_given
- withdrawal_days
- withdrawal_end_date
- follow_up_due
- notes

### daily_tasks
- id
- task_date
- due_date
- task_type
- priority
- goat_id
- batch_id
- pen_id
- title
- description
- status
- completed_at
- completed_by
- notes

### feed_inventory
- id
- item_name
- item_type
- quantity_on_hand
- unit
- cost_per_unit
- supplier
- reorder_level
- estimated_days_remaining
- last_purchase_date
- notes

### expense_ledger
- id
- expense_date
- category_id
- batch_id
- goat_id
- pen_id
- vendor
- description
- amount
- payment_method
- receipt_url
- tax_deductible
- notes

### sales
- id
- sale_date
- sale_location_id
- batch_id
- goat_id
- sale_weight
- sale_quality
- gross_sale_price
- auction_fee
- commission_fee
- yardage_fee
- transport_cost
- net_sale_price
- actual_profit
- buyer
- notes

### usda_price_history
- id
- market_id
- report_slug
- report_date
- source
- class
- quality
- sex_type
- weight_min
- weight_max
- avg_weight
- price_low_cwt
- price_high_cwt
- price_avg_cwt
- head_count
- confidence
- raw_payload_url
- created_at

## Non-negotiable business rule

The purchase approval engine must approve purchases only when the projected floor case is profitable as a #2 goat. #1 quality is upside, not the base assumption.
