import { supabase } from "./supabase.js"

async function checkAuth() {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
        window.location.href = "../auth/login.html"
    }
}

checkAuth()
