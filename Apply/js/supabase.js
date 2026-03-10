import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabaseUrl = "https://omcfcvpabyvhnyroinpn.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tY2ZjdnBhYnl2aG55cm9pbnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDYwMDksImV4cCI6MjA4ODU4MjAwOX0.EZlJa-jPFiYp6ss-MiXDqREbWU2gjAmt3eoVqffFvYo"

export const supabase = createClient(supabaseUrl, supabaseKey)
