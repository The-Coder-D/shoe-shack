
DELETE FROM public.product_images;

DO $$
DECLARE
  mapping JSONB := '[
    {"slug":"atlas-low-cream","folder":"sneaker-1","count":5,"prefix":"sneaker-1"},
    {"slug":"canvas-high-olive","folder":"sneaker-1","count":5,"prefix":"sneaker-1"},
    {"slug":"drift-knit-graphite","folder":"sneaker-1","count":5,"prefix":"sneaker-1"},
    {"slug":"court-classic-white","folder":"sneaker-2","count":4,"prefix":"sneaker-2"},
    {"slug":"luxe-runner-mist","folder":"sneaker-2","count":4,"prefix":"sneaker-2"},
    {"slug":"shadow-runner-onyx","folder":"sneaker-2","count":4,"prefix":"sneaker-2"},
    {"slug":"metro-slip-black","folder":"sneaker-3","count":4,"prefix":"sneaker-3"},
    {"slug":"trail-low-sand","folder":"sneaker-3","count":4,"prefix":"sneaker-3"},
    {"slug":"mesa-chukka-tan","folder":"boot","count":4,"prefix":"boot"},
    {"slug":"summit-boot-espresso","folder":"boot","count":4,"prefix":"boot"},
    {"slug":"field-derby-cognac","folder":"formal","count":4,"prefix":"formal"}
  ]'::jsonb;
  m JSONB;
  pid uuid;
  i int;
  fname text;
BEGIN
  FOR m IN SELECT * FROM jsonb_array_elements(mapping) LOOP
    SELECT id INTO pid FROM public.products WHERE slug = m->>'slug';
    IF pid IS NULL THEN CONTINUE; END IF;
    FOR i IN 1..(m->>'count')::int LOOP
      fname := '/images/collections/' || (m->>'folder') || '/' || (m->>'prefix') || '-' || i || '.jpg';
      INSERT INTO public.product_images(product_id, url, sort_order, alt)
        VALUES (pid, fname, i-1, m->>'slug');
    END LOOP;
  END LOOP;
END $$;
