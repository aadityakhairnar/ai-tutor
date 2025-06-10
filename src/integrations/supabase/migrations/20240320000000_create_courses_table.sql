-- Create courses table
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('completed', 'ongoing', 'planned')),
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chapters table
CREATE TABLE chapters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Users can view their own courses"
    ON courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
    ON courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
    ON courses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
    ON courses FOR DELETE
    USING (auth.uid() = user_id);

-- Chapters policies
CREATE POLICY "Users can view chapters of their courses"
    ON chapters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert chapters to their courses"
    ON chapters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can update chapters of their courses"
    ON chapters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete chapters of their courses"
    ON chapters FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = chapters.course_id
        AND courses.user_id = auth.uid()
    ));

-- Create indexes
CREATE INDEX courses_user_id_idx ON courses(user_id);
CREATE INDEX chapters_course_id_idx ON chapters(course_id); 