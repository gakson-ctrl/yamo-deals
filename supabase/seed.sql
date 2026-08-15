-- =====================================================================
-- YaMo Deals — seed.sql
-- 1 demo merchant · 8 restaurants · 24 catégories · 82 plats
-- Run with: npx supabase db seed
--
-- All IDs are hard-coded so the seed is idempotent (re-runnable).
-- ON CONFLICT DO NOTHING guards double execution.
--
-- IMPORTANT — owner_id '550e8400-e29b-41d4-a716-446655440000' is the
-- demo merchant account. This seed inserts it into auth.users and
-- profiles before the restaurant rows, so the FK is always satisfied.
-- =====================================================================

BEGIN;

-- ─── Demo merchant account ────────────────────────────────────────────────────
-- Supabase seed runs with the service role, so we can write to auth.users.
-- The demo email / password are for local dev only — never use in prod.

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '00000000-0000-0000-0000-000000000000',
  'demo.merchant@yamo.deals',
  crypt('yamo_demo_2026', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, phone, display_name, role, locale)
SELECT
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  '237677000000',
  'Demo Marchand',
  'merchant',
  'fr'
ON CONFLICT (id) DO NOTHING;

-- ─── Restaurants ──────────────────────────────────────────────────────────────
INSERT INTO restaurants (
  id, owner_id, name, description, categories,
  address, latitude, longitude,
  delivery_fee, min_order, avg_prep_time,
  rating, rating_count, is_open
) VALUES

('a0000000-0000-4000-8000-000000000001',
 '550e8400-e29b-41d4-a716-446655440000',
 'Chez Maman Beti',
 'Cuisine camerounaise traditionnelle préparée au feu de bois. Le ndolé et le poulet DG de Maman Beti sont une institution à Bastos depuis 1998.',
 ARRAY['cameroonian','traditionnel'],
 'Rue 1.750, Bastos, face à l''ambassade du Tchad, Yaoundé',
 3.888100, 11.510400, 300, 1500, 25, 4.7, 42, true),

('a0000000-0000-4000-8000-000000000002',
 '550e8400-e29b-41d4-a716-446655440000',
 'Soya King Mvog-Ada',
 'Le roi du soya à Mvog-Ada. Brochettes de bœuf marinées, poulet braisé et côtelettes grillées à la commande, servis avec plantains et piment maison.',
 ARRAY['grillades','soya'],
 'Carrefour Mvog-Ada, avenue Charles Atangana, Yaoundé',
 3.853200, 11.522100, 200, 1000, 15, 4.5, 38, true),

('a0000000-0000-4000-8000-000000000003',
 '550e8400-e29b-41d4-a716-446655440000',
 'La Cabane Sandwich',
 'Snack rapide en plein centre-ville. Sandwichs, burgers, samoussas et frites servis en moins de quinze minutes, midi et soir.',
 ARRAY['snack','sandwich','fast-food'],
 'Place de la Poste Centrale, avenue Kennedy, Yaoundé',
 3.866900, 11.516400, 300, 800, 10, 4.1, 26, true),

('a0000000-0000-4000-8000-000000000004',
 '550e8400-e29b-41d4-a716-446655440000',
 'Pizzeria Il Gusto',
 'Véritable pizza italienne cuite au four à pierre. Pâte fraîche pétrie chaque matin, mozzarella importée et une carte revisitée aux saveurs locales.',
 ARRAY['pizza','italien'],
 'Rue 1.800, quartier Bastos, près du Golf Club, Yaoundé',
 3.884700, 11.506900, 500, 2500, 30, 4.6, 31, true),

('a0000000-0000-4000-8000-000000000005',
 '550e8400-e29b-41d4-a716-446655440000',
 'Brasa Poulet Braisé',
 'Poulet braisé frais préparé à la commande. Marinade maison 12 heures, braise lente et sauce tomate épicée. La référence du poulet à Yaoundé.',
 ARRAY['grillades','poulet'],
 'Avenue du Lac, Nlongkak, à 200 m du rond-point, Yaoundé',
 3.879500, 11.517300, 300, 1500, 20, 4.8, 47, true),

('a0000000-0000-4000-8000-000000000006',
 '550e8400-e29b-41d4-a716-446655440000',
 'Boulangerie des Beignets',
 'Pâtisserie artisanale et boulangerie. Beignets chauds, viennoiseries pur beurre et formules petit-déjeuner servies dès 6 h 30.',
 ARRAY['breakfast','patisserie'],
 'Avenue Winston Churchill, quartier Warda, Yaoundé',
 3.864200, 11.513800, 200, 500, 10, 4.9, 19, true),

('a0000000-0000-4000-8000-000000000007',
 '550e8400-e29b-41d4-a716-446655440000',
 'Bar Le Pirogue',
 'Bar-restaurant convivial avec terrasse au bord de l''eau. Grillades, poissons frais, boissons fraîches et ambiance détendue tous les soirs.',
 ARRAY['drinks','bar-restaurant'],
 'Rue du Lac, quartier Melen, bord du lac Municipal, Yaoundé',
 3.872100, 11.508600, 300, 1000, 15, 4.3, 24, true),

('a0000000-0000-4000-8000-000000000008',
 '550e8400-e29b-41d4-a716-446655440000',
 'Saveurs d''Afrique',
 'Gastronomie panafricaine depuis Yaoundé. Spécialités camerounaises, sénégalaises et ivoiriennes dans un cadre élégant, avec service soigné.',
 ARRAY['pan-african','camerounais'],
 'Rue 2.005, Elig-Essono, immeuble Nkolo, Yaoundé',
 3.873400, 11.519800, 400, 2000, 25, 4.4, 33, true)

ON CONFLICT (id) DO NOTHING;


-- ─── Menu categories ─────────────────────────────────────────────────────────
-- Column is `display_order` (not sort_order) — matches 0001_schema.sql

INSERT INTO menu_categories (id, restaurant_id, name, display_order) VALUES

-- Chez Maman Beti
('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Entrées', 1),
('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Plats traditionnels', 2),
('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Boissons', 3),

-- Soya King Mvog-Ada
('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'Grillades', 1),
('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'Accompagnements', 2),
('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'Boissons', 3),

-- La Cabane Sandwich
('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000003', 'Snacks', 1),
('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000003', 'Sandwichs & Burgers', 2),
('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000003', 'Boissons', 3),

-- Pizzeria Il Gusto
('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000004', 'Entrées', 1),
('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000004', 'Pizzas', 2),
('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000004', 'Boissons', 3),

-- Brasa Poulet Braisé
('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000005', 'Grillades', 1),
('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000005', 'Accompagnements', 2),
('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000005', 'Boissons', 3),

-- Boulangerie des Beignets
('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000006', 'Pâtisseries & Beignets', 1),
('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000006', 'Petit-déjeuner', 2),
('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000006', 'Boissons chaudes', 3),

-- Bar Le Pirogue
('b0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000007', 'Grillades & Poissons', 1),
('b0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000007', 'Boissons', 2),

-- Saveurs d'Afrique
('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000008', 'Entrées', 1),
('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000008', 'Plats', 2),
('b0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000008', 'Desserts', 3),
('b0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000008', 'Boissons', 4)

ON CONFLICT (id) DO NOTHING;


-- ─── Menu items ───────────────────────────────────────────────────────────────
-- No sort_order column in schema — omitted here.

INSERT INTO menu_items (
  id, restaurant_id, category_id,
  name, description, price, image_url, is_available
) VALUES

-- ===== Chez Maman Beti · Entrées =====
('c0000000-0000-4000-8000-000000000001',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Beignets haricot',
 'Six beignets de haricot moulu frits à la minute, servis avec une pincée de piment sec.',
 500, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000002',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Salade d''avocat',
 'Avocat frais, tomates, oignons rouges et vinaigrette citronnée maison.',
 1500, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000003',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
 'Bâtons de manioc',
 'Deux bâtons de manioc traditionnels enveloppés dans des feuilles, cuits à la vapeur.',
 700, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80', true),

-- ===== Chez Maman Beti · Plats traditionnels =====
('c0000000-0000-4000-8000-000000000004',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002',
 'Ndolé aux crevettes',
 'Feuilles de ndolé mijotées à la pâte d''arachide, crevettes fraîches et viande de bœuf. Servi avec plantains ou riz.',
 4500, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000005',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002',
 'Poulet DG',
 'Poulet fermier sauté aux plantains mûrs, carottes, haricots verts et poivrons. La spécialité de la maison.',
 6000, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000006',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002',
 'Eru au water fufu',
 'Feuilles d''eru et waterleaf à l''huile de palme, viande fumée et poisson séché, servi avec water fufu.',
 3500, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000007',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002',
 'Sauce arachide au poulet',
 'Sauce d''arachide onctueuse au poulet local, relevée au njansang. Accompagnée de riz blanc.',
 4000, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80', true),

-- ===== Chez Maman Beti · Boissons =====
('c0000000-0000-4000-8000-000000000008',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
 'Jus de gingembre',
 'Gingembre frais pressé, citron et un soupçon de sucre de canne. Servi bien frais, 50 cl.',
 800, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000009',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
 'Foléré (bissap)',
 'Infusion de fleurs d''hibiscus parfumée à la menthe et à l''ananas, 50 cl.',
 700, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000010',
 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
 'Eau minérale 1,5 L',
 'Grande bouteille d''eau minérale naturelle Tangui.',
 600, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', true),

-- ===== Soya King Mvog-Ada · Grillades =====
('c0000000-0000-4000-8000-000000000011',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004',
 'Brochettes de bœuf soya',
 'Trois brochettes de bœuf marinées aux épices soya, grillées à la braise et saupoudrées de piment.',
 1500, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000012',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004',
 'Poulet braisé entier',
 'Poulet entier mariné 12 heures, braisé lentement et badigeonné de sauce tomate épicée.',
 5500, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000013',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004',
 'Demi-poulet braisé',
 'Une moitié de poulet braisé, idéale pour une personne, servie avec piment vert.',
 3000, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000014',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004',
 'Côtelettes de porc grillées',
 'Quatre côtelettes de porc marinées à l''ail et au gingembre, grillées au charbon de bois.',
 4000, 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=80', true),

-- ===== Soya King Mvog-Ada · Accompagnements =====
('c0000000-0000-4000-8000-000000000015',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005',
 'Plantains braisés',
 'Deux plantains mûrs braisés à la braise, légèrement caramélisés.',
 1000, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000016',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005',
 'Frites de patate douce',
 'Patate douce coupée en bâtonnets et frite, servie avec sel épicé.',
 1200, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000017',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000005',
 'Piment maison',
 'Petit pot de piment pilé aux oignons et à l''huile, préparé chaque matin.',
 500, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', true),

-- ===== Soya King Mvog-Ada · Boissons =====
('c0000000-0000-4000-8000-000000000018',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000006',
 'Bière 33 Export 65 cl',
 'Grande bouteille de 33 Export bien fraîche.',
 1000, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000019',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000006',
 'Top Ananas 33 cl',
 'Soda à l''ananas, servi glacé.',
 700, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000020',
 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000006',
 'Eau minérale 50 cl',
 'Petite bouteille d''eau minérale.',
 500, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', true),

-- ===== La Cabane Sandwich · Snacks =====
('c0000000-0000-4000-8000-000000000021',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000007',
 'Samoussas viande (x4)',
 'Quatre samoussas croustillants farcis au bœuf haché et aux épices.',
 1000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000022',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000007',
 'Nems au poulet (x5)',
 'Cinq nems au poulet et vermicelles, servis avec sauce aigre-douce.',
 1500, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000023',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000007',
 'Frites nature',
 'Portion généreuse de frites dorées, sel fin et ketchup.',
 1000, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000024',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000007',
 'Ailes de poulet épicées',
 'Huit ailes de poulet marinées et frites, sauce piquante à part.',
 2500, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600&q=80', true),

-- ===== La Cabane Sandwich · Sandwichs & Burgers =====
('c0000000-0000-4000-8000-000000000025',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000008',
 'Sandwich poulet mayo',
 'Baguette fraîche, émincé de poulet, salade, tomate et mayonnaise maison.',
 1800, 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000026',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000008',
 'Burger classique',
 'Steak haché 120 g, cheddar fondu, salade, tomate, oignon et sauce burger.',
 2800, 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000027',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000008',
 'Burger double bacon',
 'Deux steaks hachés, double cheddar, bacon de dinde croustillant et sauce barbecue.',
 4000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000028',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000008',
 'Shawarma bœuf',
 'Galette libanaise garnie de bœuf mariné, crudités, frites et sauce à l''ail.',
 2500, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&q=80', true),

-- ===== La Cabane Sandwich · Boissons =====
('c0000000-0000-4000-8000-000000000029',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000009',
 'Milkshake vanille',
 'Milkshake onctueux à la glace vanille, 40 cl.',
 2000, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000030',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000009',
 'Fanta Orange 50 cl',
 'Bouteille de Fanta Orange bien fraîche.',
 800, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000031',
 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000009',
 'Café expresso',
 'Expresso serré préparé à la machine.',
 700, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&q=80', true),

-- ===== Pizzeria Il Gusto · Entrées =====
('c0000000-0000-4000-8000-000000000032',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000010',
 'Bruschetta tomate-basilic',
 'Quatre tranches de pain grillé, tomates fraîches, ail, basilic et huile d''olive vierge extra.',
 2000, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000033',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000010',
 'Salade César',
 'Laitue romaine, copeaux de parmesan, croûtons dorés, blanc de poulet grillé et sauce César maison.',
 3500, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000034',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000010',
 'Beignets de mozzarella',
 'Six bâtonnets de mozzarella panés et frits, servis avec une sauce tomate au basilic.',
 2500, 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=600&q=80', true),

-- ===== Pizzeria Il Gusto · Pizzas =====
('c0000000-0000-4000-8000-000000000035',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000011',
 'Pizza Margherita',
 'Sauce tomate San Marzano, mozzarella fior di latte, basilic frais et filet d''huile d''olive. 30 cm.',
 4500, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000036',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000011',
 'Pizza Reine',
 'Sauce tomate, mozzarella, jambon de dinde, champignons de Paris et olives noires. 30 cm.',
 5500, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000037',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000011',
 'Pizza Quatre Fromages',
 'Mozzarella, gorgonzola, chèvre et parmesan sur base crème fraîche. 30 cm.',
 6500, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000038',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000011',
 'Pizza Camerounaise',
 'Notre création : sauce tomate épicée, émincé de bœuf soya, plantain mûr, oignons et mozzarella. 30 cm.',
 7000, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80', true),

-- ===== Pizzeria Il Gusto · Boissons =====
('c0000000-0000-4000-8000-000000000039',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000012',
 'Coca-Cola 33 cl',
 'Canette de Coca-Cola bien fraîche.',
 700, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000040',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000012',
 'Jus d''orange pressé',
 'Oranges pressées à la commande, sans sucre ajouté. 40 cl.',
 1500, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000041',
 'a0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000012',
 'Eau pétillante 75 cl',
 'Eau minérale gazeuse importée, servie fraîche.',
 1200, 'https://images.unsplash.com/photo-1603889280728-b5b6c9d6f2a1?w=600&q=80', true),

-- ===== Brasa Poulet Braisé · Grillades =====
('c0000000-0000-4000-8000-000000000042',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000013',
 'Poulet braisé entier',
 'Poulet entier mariné 12 heures, braisé lentement, badigeonné de sauce tomate épicée maison.',
 5500, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000043',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000013',
 'Demi-poulet braisé',
 'Moitié de poulet braisé pour une personne, avec piment vert et sauce tomate.',
 3000, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000044',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000013',
 'Quart de poulet braisé',
 'Un quart de poulet braisé, parfait en entrée ou pour les petits appétits.',
 1800, 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000045',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000013',
 'Brochettes de poulet soya',
 'Trois brochettes de poulet marinées aux épices soya et grillées à la braise.',
 1500, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80', true),

-- ===== Brasa Poulet Braisé · Accompagnements =====
('c0000000-0000-4000-8000-000000000046',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000014',
 'Plantains braisés',
 'Deux plantains mûrs braisés à la braise, légèrement caramélisés.',
 1000, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000047',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000014',
 'Frites maison',
 'Frites dorées et croustillantes préparées sur place.',
 1200, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000048',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000014',
 'Miondo',
 'Trois bâtons de miondo (manioc fermenté) cuits à la vapeur.',
 600, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80', true),

-- ===== Brasa Poulet Braisé · Boissons =====
('c0000000-0000-4000-8000-000000000049',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000015',
 'Jus de bissap',
 'Boisson d''hibiscus maison, peu sucrée et servie très fraîche. 50 cl.',
 700, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000050',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000015',
 'Castel Beer 65 cl',
 'Grande bouteille de Castel bien fraîche.',
 1000, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000051',
 'a0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000015',
 'Eau minérale 50 cl',
 'Petite bouteille d''eau minérale Tangui.',
 500, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', true),

-- ===== Boulangerie des Beignets · Pâtisseries & Beignets =====
('c0000000-0000-4000-8000-000000000052',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000016',
 'Beignets soufflés (x6)',
 'Six beignets gonflés frits à la minute, légèrement sucrés. La spécialité du matin.',
 600, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000053',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000016',
 'Beignets haricot (x6)',
 'Six beignets de haricot moulu croustillants, piment en option.',
 500, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000054',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000016',
 'Croissant au beurre',
 'Croissant pur beurre feuilleté, cuit le matin même.',
 800, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000055',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000016',
 'Pain au chocolat',
 'Feuilletage beurré avec une généreuse barre de chocolat noir à l''intérieur.',
 900, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80', true),

-- ===== Boulangerie des Beignets · Petit-déjeuner =====
('c0000000-0000-4000-8000-000000000056',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000017',
 'Formule petit-déjeuner',
 'Deux beignets soufflés + café au lait ou thé + jus de fruit. Formule complète.',
 2000, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000057',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000017',
 'Bouillie de maïs',
 'Grand bol de bouillie de maïs traditionnelle, parfumée à la vanille et légèrement sucrée.',
 1000, 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000058',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000017',
 'Pain beurre confiture',
 'Demi-baguette fraîche avec beurre et confiture de goyave maison.',
 800, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80', true),

-- ===== Boulangerie des Beignets · Boissons chaudes =====
('c0000000-0000-4000-8000-000000000059',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000018',
 'Café au lait',
 'Café arabica du Cameroun allongé au lait chaud. 25 cl.',
 800, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000060',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000018',
 'Thé Lipton au lait',
 'Thé Lipton chaud servi avec lait concentré sucré. La boisson du matin à Yaoundé.',
 700, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000061',
 'a0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000018',
 'Chocolat chaud Milo',
 'Grand bol de Milo chaud préparé au lait entier.',
 900, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80', true),

-- ===== Bar Le Pirogue · Grillades & Poissons =====
('c0000000-0000-4000-8000-000000000062',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000019',
 'Maquereau braisé',
 'Maquereau entier mariné aux herbes locales et braisé au charbon. Sauce tomate pimentée.',
 2500, 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000063',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000019',
 'Crevettes grillées',
 'Douze crevettes marinées au citron vert et à l''ail, grillées à la braise.',
 4500, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000064',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000019',
 'Brochettes de bœuf',
 'Trois brochettes de bœuf marinées et grillées, servies avec oignons et piment.',
 2000, 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000065',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000019',
 'Plantains mûrs frits',
 'Plantains bien mûrs frits à l''huile de palme rouge, légèrement sucrés.',
 1200, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80', true),

-- ===== Bar Le Pirogue · Boissons =====
('c0000000-0000-4000-8000-000000000066',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000020',
 'Bière Guinness 50 cl',
 'Bouteille de Guinness bien fraîche.',
 1200, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000067',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000020',
 'Jus de gingembre maison',
 'Gingembre frais pressé, citron vert et sucre de canne. 50 cl.',
 800, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000068',
 'a0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000020',
 'Eau minérale 50 cl',
 'Petite bouteille d''eau minérale fraîche.',
 500, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', true),

-- ===== Saveurs d'Afrique · Entrées =====
('c0000000-0000-4000-8000-000000000069',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000021',
 'Salade africaine',
 'Tomates, avocat, oignons rouges, coriandre et vinaigrette au citron vert.',
 2500, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000070',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000021',
 'Koki au plantain',
 'Gâteau de haricots blancs à l''huile de palme, cuit en feuilles de bananier, servi avec plantains.',
 2000, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000071',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000021',
 'Accras de crevettes',
 'Beignets légers aux crevettes et herbes fraîches, sauce pimentée maison.',
 3000, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', true),

-- ===== Saveurs d'Afrique · Plats =====
('c0000000-0000-4000-8000-000000000072',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000022',
 'Ndolé royal',
 'Ndolé aux crevettes géantes, bœuf et viande fumée, servi avec plantains braisés.',
 6000, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000073',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000022',
 'Poulet yassa',
 'Spécialité sénégalaise : poulet mariné aux oignons caramélisés et citron, servi avec riz blanc.',
 5500, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000074',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000022',
 'Attiéké poisson braisé',
 'Semoule de manioc ivoirienne accompagnée d''un maquereau braisé et de tomates fraîches.',
 5000, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000075',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000022',
 'Kondrè de porc',
 'Porc mijoté aux plantains verts, gingembre, ail et épices de l''Ouest. Plat généreux.',
 5500, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80', true),

-- ===== Saveurs d'Afrique · Desserts =====
('c0000000-0000-4000-8000-000000000076',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000023',
 'Fondant au chocolat',
 'Fondant au cœur coulant, chocolat noir 70 %, servi tiède avec crème fouettée.',
 2500, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000077',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000023',
 'Salade de fruits frais',
 'Mangue, papaye, ananas et banane, jus de citron vert et feuilles de menthe fraîche.',
 2000, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80', true),

-- ===== Saveurs d'Afrique · Boissons =====
('c0000000-0000-4000-8000-000000000078',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000024',
 'Cocktail de fruits frais',
 'Jus de mangue, ananas, gingembre et citron vert, préparé à la commande. 40 cl.',
 2000, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000079',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000024',
 'Foléré premium',
 'Infusion d''hibiscus enrichie au gingembre et à la menthe poivrée, servie glacée. 50 cl.',
 1500, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000080',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000024',
 'Eau minérale 75 cl',
 'Grande bouteille d''eau minérale naturelle.',
 800, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000081',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000024',
 'Djino Cocktail 33 cl',
 'Soda Djino saveur cocktail de fruits, servi glacé.',
 700, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=600&q=80', true),

('c0000000-0000-4000-8000-000000000082',
 'a0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000024',
 'Vin rouge verre',
 'Verre de vin rouge importé d''Afrique du Sud. 15 cl.',
 3000, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80', true)

ON CONFLICT (id) DO NOTHING;

COMMIT;

-- =====================================================================
-- Rollback helper (dev/local only) — supprime tout le jeu de test :
--
-- DELETE FROM menu_items      WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = '550e8400-e29b-41d4-a716-446655440000');
-- DELETE FROM menu_categories WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = '550e8400-e29b-41d4-a716-446655440000');
-- DELETE FROM restaurants     WHERE owner_id = '550e8400-e29b-41d4-a716-446655440000';
-- DELETE FROM profiles        WHERE id = '550e8400-e29b-41d4-a716-446655440000';
-- DELETE FROM auth.users      WHERE id = '550e8400-e29b-41d4-a716-446655440000';
-- =====================================================================
