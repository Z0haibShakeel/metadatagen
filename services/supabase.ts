
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqscwqhzunyiqqeszwso.supabase.co'; // TODO: Replace with your actual Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxc2N3cWh6dW55aXFxZXN6d3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTAyNzcsImV4cCI6MjA4MTQ4NjI3N30.jt50PaS1g7aCW-Sp7lBqtyaawJ8-PMnX8TGbBOUEnTc'; // TODO: Replace with your actual Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
