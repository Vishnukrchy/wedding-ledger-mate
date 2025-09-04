/*
  # Add booking and wedding fields to profiles table

  1. New Columns
    - `wedding_date` (date) - The planned wedding date
    - `contact_phone` (text) - Contact phone number
    - `estimated_guests` (integer) - Number of expected guests
    - `venue_preference` (text) - Preferred venue type
    - `budget_range` (text) - Budget range for the wedding
    - `package_preference` (text) - Selected package name
    - `booking_data` (jsonb) - Complete booking form data

  2. Security
    - All fields are optional and can be updated by the user
    - Maintains existing RLS policies
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add wedding_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wedding_date'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN wedding_date DATE;
  END IF;

  -- Add contact_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN contact_phone TEXT;
  END IF;

  -- Add estimated_guests column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'estimated_guests'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN estimated_guests INTEGER;
  END IF;

  -- Add venue_preference column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'venue_preference'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN venue_preference TEXT;
  END IF;

  -- Add budget_range column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN budget_range TEXT;
  END IF;

  -- Add package_preference column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'package_preference'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN package_preference TEXT;
  END IF;

  -- Add booking_data column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'booking_data'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN booking_data JSONB;
  END IF;
END $$;