import os
import urllib.request
import time

base_dir = r"c:\Users\2024\OneDrive\Documents\antigravity\proj1\app\static\images"
os.makedirs(base_dir, exist_ok=True)

images_to_download = {
    # Categories
    "cat_burgers.jpg": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "cat_chicken.jpg": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80",
    "cat_pizza.jpg": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "cat_wraps.jpg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "cat_sides.jpg": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80",
    "cat_beverages.jpg": "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=500&q=80",
    "cat_desserts.jpg": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80",
    "default_cat.jpg": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
    "default_food.jpg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
    
    # Burgers
    "item_smash.jpg": "https://images.unsplash.com/photo-1594212586058-ae45308ce004?w=500&q=80",
    "item_zinger.jpg": "https://images.unsplash.com/photo-1615719417327-21a48fb56434?w=500&q=80",
    "item_bbq.jpg": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
    "item_cheese.jpg": "https://images.unsplash.com/photo-1586816001966-79b736744398?w=500&q=80",
    
    # Chicken
    "item_2pc.jpg": "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=500&q=80",
    "item_5pc.jpg": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80",
    "item_10pc.jpg": "https://images.unsplash.com/photo-1626082895617-2c636735db91?w=500&q=80",
    "item_wings.jpg": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    
    # Pizza
    "item_pepperoni.jpg": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80",
    "item_supreme.jpg": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80", # fallback
    "item_margherita.jpg": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80",
    
    # Wraps
    "item_shawarma.jpg": "https://images.unsplash.com/photo-1648823153754-5221975e5330?w=500&q=80",
    "item_wrap.jpg": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "item_seekh.jpg": "https://images.unsplash.com/photo-1599487405705-8e3d069c9b58?w=500&q=80",
    
    # Sides
    "item_fries.jpg": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&q=80",
    "item_coleslaw.jpg": "https://images.unsplash.com/photo-1625937759404-585bbccf7267?w=500&q=80",
    "item_onion.jpg": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=500&q=80",
    "item_corn.jpg": "https://images.unsplash.com/photo-1596766467362-e1c4e97ddfb8?w=500&q=80",
    
    # Beverages
    "item_cola.jpg": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "item_mango.jpg": "https://images.unsplash.com/photo-1546888632-47d34190b4dc?w=500&q=80",
    "item_choco.jpg": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80",
    "item_lemon.jpg": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    
    # Desserts
    "item_lava.jpg": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&q=80",
    "item_sundae.jpg": "https://images.unsplash.com/photo-1563805042-7684c8a9e9ce?w=500&q=80",
    "item_brownie.jpg": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
}

for filename, url in images_to_download.items():
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Downloaded {filename}")
        except Exception as e:
            print(f"Failed to download {filename}: {e}")
            # create empty file as fallback so browser doesn't error out repeatedly
            open(filepath, 'w').close()
        time.sleep(0.5)

print("Done downloading images.")
