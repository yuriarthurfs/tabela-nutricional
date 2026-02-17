/*
  # RotulagemBR Database Schema
  
  Creates the complete database structure for the RotulagemBR application.
  
  ## New Tables
  
  1. `recipes`
     - Stores recipe/product information
     - Fields: id, name, category, product_type, final_yield_g, portion_g, household_measure, num_portions, user_id
  
  2. `ingredient_lines`
     - Stores ingredients used in each recipe with TACO data snapshot
     - Fields: id, recipe_id, taco_food_id, name, quantity_g, nutrients_100g_snapshot
  
  3. `added_sugars`
     - Stores added sugars information per recipe
     - Fields: id, recipe_id, ingredient_name, added_sugar_g
  
  4. `nutrition_totals`
     - Stores calculated nutrition values (totals, per portion, per 100g)
     - Fields: id, recipe_id, totals_recipe, per_portion, per_100g, calculation_version
  
  5. `front_labels`
     - Stores front label (lupa) determination
     - Fields: id, recipe_id, alto_em_added_sugar, alto_em_sat_fat, alto_em_sodium
  
  6. `allergens`
     - Stores allergen information
     - Fields: id, recipe_id, contem, pode_conter, fonte_inferida, fonte_manual
  
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
*/

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  category text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('solid', 'liquid')),
  final_yield_g decimal NOT NULL,
  portion_g decimal NOT NULL,
  household_measure text,
  num_portions integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON recipes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ingredient_lines table
CREATE TABLE IF NOT EXISTS ingredient_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  taco_food_id text,
  name text NOT NULL,
  quantity_g decimal NOT NULL,
  nutrients_100g_snapshot jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ingredient_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ingredients of own recipes"
  ON ingredient_lines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ingredients to own recipes"
  ON ingredient_lines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ingredients of own recipes"
  ON ingredient_lines FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ingredients of own recipes"
  ON ingredient_lines FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredient_lines.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create added_sugars table
CREATE TABLE IF NOT EXISTS added_sugars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_name text NOT NULL,
  added_sugar_g decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE added_sugars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view added sugars of own recipes"
  ON added_sugars FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = added_sugars.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert added sugars to own recipes"
  ON added_sugars FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = added_sugars.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update added sugars of own recipes"
  ON added_sugars FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = added_sugars.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = added_sugars.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete added sugars of own recipes"
  ON added_sugars FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = added_sugars.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create nutrition_totals table
CREATE TABLE IF NOT EXISTS nutrition_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  totals_recipe jsonb NOT NULL,
  per_portion jsonb NOT NULL,
  per_100g jsonb NOT NULL,
  calculation_version text DEFAULT 'IN75/2020' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE nutrition_totals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nutrition totals of own recipes"
  ON nutrition_totals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = nutrition_totals.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert nutrition totals to own recipes"
  ON nutrition_totals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = nutrition_totals.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update nutrition totals of own recipes"
  ON nutrition_totals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = nutrition_totals.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = nutrition_totals.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete nutrition totals of own recipes"
  ON nutrition_totals FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = nutrition_totals.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create front_labels table
CREATE TABLE IF NOT EXISTS front_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  alto_em_added_sugar boolean DEFAULT false NOT NULL,
  alto_em_sat_fat boolean DEFAULT false NOT NULL,
  alto_em_sodium boolean DEFAULT false NOT NULL,
  override_justification text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE front_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view front labels of own recipes"
  ON front_labels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = front_labels.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert front labels to own recipes"
  ON front_labels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = front_labels.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update front labels of own recipes"
  ON front_labels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = front_labels.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = front_labels.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete front labels of own recipes"
  ON front_labels FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = front_labels.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create allergens table
CREATE TABLE IF NOT EXISTS allergens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  contem text[] DEFAULT '{}' NOT NULL,
  pode_conter text[] DEFAULT '{}' NOT NULL,
  fonte_inferida jsonb DEFAULT '{}' NOT NULL,
  fonte_manual text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view allergens of own recipes"
  ON allergens FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = allergens.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert allergens to own recipes"
  ON allergens FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = allergens.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update allergens of own recipes"
  ON allergens FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = allergens.recipe_id
      AND recipes.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = allergens.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete allergens of own recipes"
  ON allergens FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = allergens.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredient_lines_recipe_id ON ingredient_lines(recipe_id);
CREATE INDEX IF NOT EXISTS idx_added_sugars_recipe_id ON added_sugars(recipe_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_totals_recipe_id ON nutrition_totals(recipe_id);
CREATE INDEX IF NOT EXISTS idx_front_labels_recipe_id ON front_labels(recipe_id);
CREATE INDEX IF NOT EXISTS idx_allergens_recipe_id ON allergens(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);