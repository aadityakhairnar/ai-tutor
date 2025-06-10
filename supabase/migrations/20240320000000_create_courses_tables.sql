-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planned',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
    id SERIAL PRIMARY KEY,
    course_id TEXT REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Users can view their own courses"
    ON public.courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
    ON public.courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
    ON public.courses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
    ON public.courses FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for chapters
CREATE POLICY "Users can view chapters of their courses"
    ON public.chapters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert chapters to their courses"
    ON public.chapters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can update chapters of their courses"
    ON public.chapters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete chapters of their courses"
    ON public.chapters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS courses_user_id_idx ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS chapters_course_id_idx ON public.chapters(course_id); 