"""Seed data: schools across major Indian metros (Mumbai, Bangalore, Delhi, Noida, Gurgaon).

Images are Indian-themed (classrooms, students, parents) sourced from Unsplash.
"""

# Curated Indian-themed image pool (rotated across schools)
INDIAN_IMAGES = [
    "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&q=80&auto=format&fit=crop",  # Indian girl reading
    "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80&auto=format&fit=crop",  # Indian school kids
    "https://images.unsplash.com/photo-1774438026136-9736ec28922a?w=800&q=80&auto=format&fit=crop",  # Indian parent + child
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80&auto=format&fit=crop",  # Children classroom
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop",  # Chalkboard
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80&auto=format&fit=crop",  # Library
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80&auto=format&fit=crop",  # Class
    "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80&auto=format&fit=crop",  # Books study
    "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80&auto=format&fit=crop",  # Indian boy student
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&auto=format&fit=crop",  # School kids
]


def _img(i):
    return INDIAN_IMAGES[i % len(INDIAN_IMAGES)]


# ---------------- MUMBAI ----------------
MUMBAI_RAW = [
    ("Dhirubhai Ambani International School", "Bandra Kurla Complex", "IB & IGCSE", 850000, 1200000, 4.8, 99.1, 222, 2003, ["sports","music","digital","drama","swimming","library"], "One of Mumbai's premier international schools known for academic excellence and modern infrastructure.", True, "2026-03-15", "https://www.da-is.org/admissions", "+91-22-4068-1500"),
    ("Cathedral and John Connon School", "Fort", "ICSE & IGCSE", 200000, 450000, 4.7, 99.4, 1123, 1860, ["sports","music","drama","library","art"], "A heritage institution with 160+ years of legacy, blending tradition with academic rigor.", True, "2026-02-28", "https://www.cathedral-school.com", "+91-22-2270-3213"),
    ("Bombay Scottish School", "Mahim", "ICSE", 95000, 220000, 4.6, 98.7, 1456, 1847, ["sports","music","drama","library","swimming"], "Established in 1847, known for holistic education and strong alumni network.", True, "2026-03-10", "https://bombayscottish.in", "+91-22-2444-5193"),
    ("Jamnabai Narsee School", "Vile Parle West", "ICSE & IB", 180000, 500000, 4.6, 98.2, 1899, 1971, ["sports","music","digital","drama","swimming","library"], "Renowned for both academic excellence and a vibrant extracurricular program.", True, "2026-03-20", "https://jamnabainarseeschool.org", "+91-22-2613-5511"),
    ("Hill Spring International School", "Tardeo", "IGCSE & IB", 450000, 850000, 4.5, 97.9, 612, 2005, ["sports","music","digital","drama","art"], "Compact urban campus offering rigorous international curriculum.", True, "2026-03-05", "https://hillspring.org", "+91-22-2353-1234"),
    ("Ecole Mondiale World School", "Juhu", "IB", 700000, 1100000, 4.7, 99.0, 934, 2004, ["sports","music","digital","drama","swimming","library","art"], "IB World School with global outlook and immersive campus life.", True, "2026-03-12", "https://ecolemondiale.org", "+91-22-2660-1000"),
    ("American School of Bombay", "Bandra Kurla Complex", "American & IB", 1400000, 1900000, 4.8, 98.0, 2189, 1981, ["sports","music","digital","drama","swimming","library","art"], "International school with a diverse student body from over 50 nationalities.", True, "2026-02-15", "https://asbindia.org", "+91-22-6772-7272"),
    ("Oberoi International School", "Goregaon East", "IB", 800000, 1300000, 4.7, 97.7, 1528, 2008, ["sports","music","digital","drama","swimming","library","art"], "State-of-the-art campus with focus on inquiry-based learning.", True, "2026-03-08", "https://oberoi-is.net", "+91-22-4236-3000"),
    ("RBK School", "Khar West", "CBSE", 250000, 400000, 4.5, 98.3, 781, 1995, ["sports","music","digital","library"], "Modern CBSE school with strong emphasis on STEM education.", True, "2026-03-25", "#", "+91-22-2649-1234"),
    ("Podar International School Powai", "Powai", "CBSE & IB", 220000, 550000, 4.4, 96.5, 1342, 1927, ["sports","music","digital","drama","library"], "Part of the Podar group with strong legacy and contemporary teaching methods.", True, "2026-03-30", "https://podar.org", "+91-22-6781-2345"),
    ("Singapore International School", "Dahisar", "IGCSE & IB", 380000, 750000, 4.4, 96.8, 543, 2003, ["sports","music","digital","swimming","library"], "Trilingual program with Singapore curriculum heritage.", True, "2026-04-05", "https://singaporeschools.in", "+91-22-2828-2828"),
    ("B.D. Somani International School", "Cuffe Parade", "IGCSE & IB", 600000, 1000000, 4.6, 98.5, 487, 1999, ["sports","music","drama","digital","art"], "Boutique international school in south Mumbai with personalized learning.", False, "2026-01-30", "https://bdsis.org", "+91-22-2218-3724"),
    ("JBCN International School", "Parel", "IB & IGCSE", 350000, 700000, 4.5, 97.6, 822, 2010, ["sports","music","digital","drama","swimming"], "Modern infrastructure and innovative pedagogy with multiple Mumbai campuses.", True, "2026-03-18", "https://jbcnschool.edu.in", "+91-22-6173-7173"),
    ("Aditya Birla World Academy", "Tardeo", "IGCSE & IB", 550000, 950000, 4.6, 98.1, 1102, 2008, ["sports","music","digital","drama","library","art"], "Premier school with emphasis on values-based education.", True, "2026-03-22", "https://abwa.edu.in", "+91-22-6131-0000"),
    ("Don Bosco High School Matunga", "Matunga", "ICSE", 60000, 150000, 4.5, 97.8, 1789, 1941, ["sports","music","drama","library"], "Salesian institution known for discipline and academic excellence.", True, "2026-04-10", "https://donboscomatunga.com", "+91-22-2402-6868"),
    ("St. Xavier's High School", "Fort", "ICSE", 50000, 120000, 4.6, 98.7, 2298, 1869, ["sports","music","drama","library"], "Historic Jesuit school producing leaders since 1869.", True, "2026-03-15", "https://stxaviershighschool.in", "+91-22-2262-0661"),
    ("Campion School", "Cooperage", "ICSE", 80000, 180000, 4.7, 99.2, 1467, 1943, ["sports","music","drama","library"], "All-boys Jesuit school with rich heritage and academic rigor.", True, "2026-03-08", "https://campion.edu.in", "+91-22-2204-3415"),
    ("Activity High School", "Pedder Road", "ICSE", 90000, 200000, 4.5, 98.2, 612, 1968, ["sports","music","drama","library","art"], "Progressive girls' school with focus on holistic development.", True, "2026-03-12", "https://activityhigh.com", "+91-22-2351-4456"),
    ("Arya Vidya Mandir", "Bandra West", "ICSE", 75000, 170000, 4.4, 96.3, 934, 1955, ["sports","music","library","digital"], "Co-ed school with strong Indian values and modern curriculum.", True, "2026-03-20", "https://avm.edu.in", "+91-22-2645-3401"),
    ("Maneckji Cooper School", "Juhu", "ICSE", 70000, 160000, 4.3, 95.7, 1023, 1957, ["sports","music","drama","library"], "Parsi heritage school with co-educational environment.", True, "2026-03-25", "https://maneckjicooper.com", "+91-22-2660-2541"),
    ("Greenlawns School", "Worli", "ICSE", 85000, 190000, 4.4, 96.1, 712, 1947, ["sports","music","drama","library"], "Co-ed school with reputed academic standards.", True, "2026-03-18", "https://greenlawnsschool.com", "+91-22-2495-3232"),
    ("Hiranandani Foundation School", "Powai", "ICSE", 130000, 280000, 4.5, 97.5, 1289, 1990, ["sports","music","digital","drama","swimming","library"], "Modern campus in Hiranandani Gardens with excellent facilities.", True, "2026-03-15", "https://hfspowai.com", "+91-22-2570-1234"),
    ("Bombay Cambridge International", "Andheri East", "IGCSE", 250000, 500000, 4.3, 95.4, 678, 1992, ["sports","music","digital","drama","library"], "Cambridge international curriculum with global outlook.", True, "2026-03-22", "https://bcis.org.in", "+91-22-2839-3000"),
    ("Ryan International Malad", "Malad West", "ICSE & CBSE", 90000, 200000, 4.1, 93.8, 1567, 1976, ["sports","music","digital","library"], "Pan-India chain with strong infrastructure in Malad.", True, "2026-04-01", "https://ryangroup.org", "+91-22-2877-1234"),
    ("Vibgyor High Goregaon", "Goregaon West", "ICSE & IGCSE", 200000, 450000, 4.3, 95.9, 892, 2004, ["sports","music","digital","drama","swimming"], "Modern campus with focus on STEM and global curricula.", True, "2026-03-28", "https://vibgyorhigh.com", "+91-22-4001-2345"),
    ("Billabong High International", "Malad East", "ICSE & IGCSE", 180000, 400000, 4.2, 94.7, 723, 2003, ["sports","music","digital","drama","library"], "Innovative pedagogy with strong arts integration.", True, "2026-04-05", "https://billabonghighschool.com", "+91-22-2880-5500"),
    ("DAV Public School Airoli", "Airoli (Navi Mumbai)", "CBSE", 60000, 130000, 4.2, 95.0, 1234, 1998, ["sports","music","digital","library"], "Value-based education with strong CBSE academics.", True, "2026-04-15", "https://davairoli.org", "+91-22-2779-1234"),
    ("Apeejay School Nerul", "Nerul", "CBSE", 110000, 230000, 4.3, 95.6, 987, 1999, ["sports","music","digital","drama","library"], "Co-ed CBSE school with focus on character building.", True, "2026-03-28", "https://apeejay.edu", "+91-22-2770-1234"),
    ("Bombay International School", "Babulnath", "IGCSE & IB", 350000, 700000, 4.5, 97.7, 689, 1962, ["sports","music","drama","library"], "Pioneer of international education in Mumbai, located in heart of south Mumbai.", True, "2026-03-10", "https://bisschool.com", "+91-22-2363-8121"),
    ("GD Somani Memorial School", "Cuffe Parade", "ICSE", 100000, 220000, 4.4, 96.8, 567, 1972, ["sports","music","drama","library"], "Quality ICSE education in South Mumbai with strong heritage.", True, "2026-03-20", "https://gdsomani.com", "+91-22-2218-3060"),
    ("Utpal Shanghvi Global School", "Juhu", "ICSE & IGCSE", 250000, 550000, 4.4, 96.5, 745, 2005, ["sports","music","digital","drama","swimming"], "Innovative learning environment with global outlook.", True, "2026-03-25", "https://usgs.in", "+91-22-2614-3636"),
    ("St. Mary's School Mazagaon", "Mazagaon", "ICSE", 55000, 130000, 4.6, 98.4, 1456, 1864, ["sports","music","drama","library"], "Jesuit institution with 160+ years of heritage in education.", True, "2026-03-05", "https://stmarysmazagon.com", "+91-22-2371-1881"),
    ("Smt. Sulochanadevi Singhania", "Thane", "ICSE & ISC", 80000, 180000, 4.5, 97.6, 1289, 1969, ["sports","music","digital","drama","library","swimming"], "Among Thane's most reputed schools with excellent academics.", True, "2026-03-15", "https://singhaniaschool.org", "+91-22-2533-1234"),
    ("Hiranandani Upscale School Thane", "Thane West", "CBSE & IGCSE", 130000, 320000, 4.4, 96.7, 876, 2009, ["sports","music","digital","drama","library"], "Premium school in Hiranandani Estate with modern amenities.", True, "2026-03-20", "#", "+91-22-2589-1234"),
    ("Lodha World School Thane", "Thane (Dombivli)", "CBSE & IGCSE", 120000, 280000, 4.3, 95.4, 654, 2014, ["sports","music","digital","drama","library"], "Contemporary school with focus on global citizenship.", True, "2026-03-28", "https://lodhaworldschool.com", "+91-22-2570-9999"),
]

# ---------------- BANGALORE ----------------
BANGALORE_RAW = [
    ("National Public School Indiranagar", "Indiranagar", "CBSE", 180000, 320000, 4.7, 99.2, 2189, 1959, ["sports","music","digital","drama","library"], "One of Bangalore's most coveted CBSE schools known for academics.", True, "2026-03-15", "https://npsi.edu.in", "+91-80-2521-2188"),
    ("The International School Bangalore (TISB)", "Whitefield", "IGCSE & IB", 1200000, 1800000, 4.8, 98.9, 1456, 1999, ["sports","music","digital","drama","swimming","library","art"], "Sprawling 140-acre residential campus offering international curriculum.", True, "2026-02-28", "https://tisb.org", "+91-80-2841-8000"),
    ("Mallya Aditi International School", "Yelahanka", "IGCSE & IB", 700000, 1100000, 4.6, 97.8, 612, 1990, ["sports","music","digital","drama","library","art"], "Progressive school with arts-integrated pedagogy.", True, "2026-03-10", "https://mais.edu.in", "+91-80-2856-3500"),
    ("Inventure Academy", "Whitefield (Sarjapur)", "IGCSE & IB", 500000, 900000, 4.5, 97.4, 832, 2005, ["sports","music","digital","drama","library"], "Holistic learning with focus on critical thinking.", True, "2026-03-12", "https://inventureacademy.com", "+91-80-2785-7474"),
    ("Bishop Cotton Boys' School", "Ashok Nagar", "ICSE", 90000, 190000, 4.6, 98.1, 1789, 1865, ["sports","music","drama","library"], "Historic 160-year-old institution for boys with rich heritage.", True, "2026-03-08", "https://bishopcottonboys.edu.in", "+91-80-2221-3601"),
    ("Bishop Cotton Girls' School", "Residency Road", "ICSE", 90000, 190000, 4.6, 98.4, 1623, 1865, ["sports","music","drama","library","art"], "Sister institution focused on academics and character.", True, "2026-03-08", "https://bishopcottongirls.in", "+91-80-2227-2222"),
    ("Greenwood High International", "Sarjapur", "IGCSE & IB", 350000, 700000, 4.4, 96.7, 1102, 2004, ["sports","music","digital","drama","swimming","library"], "Sprawling campus with international curriculum and strong sports.", True, "2026-03-20", "https://greenwoodhigh.edu.in", "+91-80-2785-1117"),
    ("Stonehill International School", "Yelahanka", "IB", 1100000, 1600000, 4.7, 98.6, 487, 2007, ["sports","music","digital","drama","swimming","library","art"], "Residential IB school with global outlook.", True, "2026-02-20", "https://stonehill.in", "+91-80-2284-5300"),
    ("Trio World Academy", "Sahakara Nagar", "CBSE & IB", 350000, 700000, 4.5, 97.3, 723, 2008, ["sports","music","digital","drama","library"], "Modern campus blending CBSE and IB curriculum.", True, "2026-03-18", "https://trioworldacademy.com", "+91-80-2362-7777"),
    ("Vidyashilp Academy", "Jakkur", "IGCSE", 350000, 600000, 4.6, 97.9, 567, 1989, ["sports","music","digital","drama","library","art"], "Established progressive school with focus on inquiry-based learning.", True, "2026-03-15", "https://vidyashilp.com", "+91-80-2856-2580"),
    ("DPS Bangalore East", "Whitefield", "CBSE", 130000, 240000, 4.3, 95.6, 1456, 2002, ["sports","music","digital","library"], "Part of DPS family with strong CBSE academics.", True, "2026-03-25", "https://dpsbangaloreeast.com", "+91-80-2845-1099"),
    ("Sishu Griha Senior School", "Koramangala", "ICSE", 220000, 380000, 4.5, 97.5, 423, 1973, ["sports","music","drama","library"], "Child-centred school with progressive Montessori roots.", True, "2026-03-22", "https://sishugriha.org", "+91-80-2553-2773"),
    ("Canadian International School", "Yelahanka", "IB", 800000, 1300000, 4.6, 98.0, 612, 2004, ["sports","music","digital","drama","swimming","library","art"], "Canadian-accredited international curriculum.", True, "2026-03-05", "https://cisb.org.in", "+91-80-4249-4444"),
    ("Indus International School Bangalore", "Sarjapur Bidaraguppe", "IB & IGCSE", 950000, 1500000, 4.6, 97.8, 723, 2003, ["sports","music","digital","drama","swimming","library","art"], "Lush 40-acre campus with residential option.", True, "2026-02-28", "https://indusschool.com", "+91-80-2289-7777"),
    ("Ekya School JP Nagar", "JP Nagar", "ICSE", 240000, 420000, 4.5, 97.1, 489, 2010, ["sports","music","digital","drama","library","art"], "Progressive school with strong focus on creativity.", True, "2026-03-30", "https://ekyaschools.com", "+91-80-4242-7777"),
]

# ---------------- DELHI ----------------
DELHI_RAW = [
    ("Delhi Public School RK Puram", "RK Puram", "CBSE", 110000, 200000, 4.6, 98.4, 2456, 1972, ["sports","music","digital","drama","swimming","library"], "DPS's flagship school known for top JEE/NEET results.", True, "2026-03-10", "https://dpsrkp.net", "+91-11-2616-5961"),
    ("Modern School Barakhamba Road", "Barakhamba Road", "CBSE", 150000, 280000, 4.7, 98.7, 1789, 1920, ["sports","music","drama","library","art"], "Centenary institution with celebrated alumni and tradition.", True, "2026-03-12", "https://modernschool.net", "+91-11-2331-1244"),
    ("Sanskriti School", "Chanakyapuri", "CBSE", 140000, 250000, 4.7, 98.9, 1234, 1998, ["sports","music","digital","drama","library","art"], "Premier diplomatic-area school with progressive pedagogy.", True, "2026-03-15", "https://sanskritischool.edu.in", "+91-11-2467-8002"),
    ("Vasant Valley School", "Vasant Kunj", "CBSE & IGCSE", 280000, 480000, 4.7, 98.6, 1102, 1990, ["sports","music","digital","drama","swimming","library","art"], "Progressive co-ed school with strong global outlook.", True, "2026-03-05", "https://vasantvalley.org", "+91-11-2613-4738"),
    ("Springdales School Pusa Road", "Pusa Road", "CBSE", 120000, 220000, 4.5, 97.6, 1456, 1955, ["sports","music","drama","library","art"], "Co-ed school with strong emphasis on community service.", True, "2026-03-18", "https://springdales.com", "+91-11-2587-9000"),
    ("The Shri Ram School Moulsari", "Moulsari Avenue (DLF)", "CBSE & IGCSE", 380000, 650000, 4.7, 98.4, 1023, 1988, ["sports","music","digital","drama","library","art"], "Renowned for progressive pedagogy and student-centered learning.", True, "2026-03-08", "https://tsrs.org", "+91-11-2615-2241"),
    ("American Embassy School Delhi", "Chanakyapuri", "American & IB", 2200000, 2800000, 4.8, 98.9, 612, 1952, ["sports","music","digital","drama","swimming","library","art"], "American curriculum for the international community.", True, "2026-02-15", "https://aes.ac.in", "+91-11-2688-8854"),
    ("The British School Delhi", "Chanakyapuri", "IGCSE & IB", 1800000, 2400000, 4.7, 98.5, 723, 1963, ["sports","music","digital","drama","swimming","library","art"], "British curriculum school with strong international alumni.", True, "2026-02-20", "https://british-school.org", "+91-11-2688-4750"),
    ("Sardar Patel Vidyalaya", "Lodi Estate", "CBSE", 70000, 130000, 4.5, 97.4, 1289, 1958, ["sports","music","drama","library"], "Gandhian-values school with bilingual education.", True, "2026-03-20", "https://sardarpatelvidyalaya.com", "+91-11-2461-1885"),
    ("Bal Bharati Public School Pitampura", "Pitampura", "CBSE", 60000, 110000, 4.4, 96.8, 1567, 1944, ["sports","music","digital","library"], "Established CBSE school with strong academic record.", True, "2026-03-22", "https://bbpspp.com", "+91-11-2735-8800"),
]

# ---------------- NOIDA ----------------
NOIDA_RAW = [
    ("DPS Noida", "Sector 30, Noida", "CBSE", 110000, 200000, 4.5, 97.6, 1789, 1996, ["sports","music","digital","drama","swimming","library"], "Premier CBSE school in Noida with vast campus.", True, "2026-03-15", "https://dpsnoida.com", "+91-120-244-5666"),
    ("Amity International School Sector 44", "Sector 44, Noida", "CBSE", 140000, 240000, 4.4, 96.7, 2189, 2003, ["sports","music","digital","drama","library"], "Part of Amity group with modern infrastructure.", True, "2026-03-12", "https://amitynoida.com", "+91-120-243-1100"),
    ("The Heritage School Noida", "Sector 23, Noida", "CBSE", 180000, 310000, 4.5, 97.4, 612, 2009, ["sports","music","digital","drama","library","art"], "Progressive co-ed school focused on holistic learning.", True, "2026-03-20", "https://theheritageschoolnoida.com", "+91-120-247-5000"),
    ("Lotus Valley International School", "Sector 126, Noida", "CBSE & IGCSE", 250000, 450000, 4.4, 96.5, 723, 2007, ["sports","music","digital","drama","swimming","library"], "Modern campus with global curriculum options.", True, "2026-03-18", "https://lotusvalleynoida.com", "+91-120-454-0900"),
    ("Step by Step School Noida", "Sector 132, Noida", "IGCSE & IB", 380000, 650000, 4.6, 97.9, 567, 2005, ["sports","music","digital","drama","library","art"], "Boutique school with personalised attention.", True, "2026-03-08", "https://stepbystepschool.org", "+91-120-405-8000"),
    ("Genesis Global School", "Sector 132, Noida", "CBSE & IB", 280000, 550000, 4.5, 97.2, 489, 2010, ["sports","music","digital","drama","library"], "Residential and day school with global curriculum.", True, "2026-03-25", "https://genesisglobalschool.edu.in", "+91-120-404-9900"),
    ("Mayoor School Noida", "Sector 126, Noida", "CBSE", 150000, 280000, 4.4, 96.6, 612, 2006, ["sports","music","digital","library"], "Established school with strong academic focus.", True, "2026-03-22", "https://mayoornoida.com", "+91-120-454-1234"),
    ("Apeejay School Noida", "Sector 16A, Noida", "CBSE", 100000, 180000, 4.3, 95.7, 1023, 1991, ["sports","music","digital","library"], "Part of Apeejay group with strong CBSE academics.", True, "2026-03-28", "https://apeejaynoida.in", "+91-120-251-1111"),
    ("Cambridge School Noida", "Sector 27, Noida", "CBSE", 90000, 170000, 4.3, 95.4, 876, 1989, ["sports","music","drama","library"], "Long-standing CBSE school in heart of Noida.", True, "2026-04-02", "https://cambridgeschool.in", "+91-120-251-3300"),
    ("Pathways World School Aravali", "Aravali Range (border)", "IB & IGCSE", 1100000, 1700000, 4.7, 98.3, 423, 2003, ["sports","music","digital","drama","swimming","library","art"], "Residential IB campus serving Delhi NCR.", True, "2026-02-25", "https://pathways.in", "+91-124-451-1000"),
]

# ---------------- GURGAON ----------------
GURGAON_RAW = [
    ("Heritage Xperiential Learning School", "Sector 62, Gurgaon", "CBSE & IGCSE", 350000, 600000, 4.6, 97.8, 723, 2013, ["sports","music","digital","drama","library","art"], "Experiential learning model with progressive pedagogy.", True, "2026-03-10", "https://hxls.theheritageschool.in", "+91-124-451-9000"),
    ("The Shri Ram School Aravali", "Aravali Hills, Gurgaon", "CBSE & IGCSE", 420000, 720000, 4.7, 98.4, 612, 1988, ["sports","music","digital","drama","swimming","library","art"], "Sister campus of TSRS Moulsari with hilltop campus.", True, "2026-03-08", "https://tsrs.org", "+91-124-238-3340"),
    ("Scottish High International School", "Sector 57, Gurgaon", "CBSE & IGCSE", 280000, 520000, 4.5, 97.4, 891, 2006, ["sports","music","digital","drama","swimming","library"], "International school with Scottish curriculum heritage.", True, "2026-03-15", "https://scottishigh.com", "+91-124-450-2300"),
    ("GD Goenka World School", "Sohna Road, Gurgaon", "CBSE & IB", 450000, 850000, 4.5, 97.6, 612, 2002, ["sports","music","digital","drama","swimming","library","art"], "Residential & day school with multiple curriculum options.", True, "2026-03-05", "https://gdgws.com", "+91-124-227-3000"),
    ("DPS International Gurgaon", "Sector 102, Gurgaon", "CBSE & IGCSE", 320000, 580000, 4.5, 97.3, 1023, 2008, ["sports","music","digital","drama","library"], "International DPS with strong curriculum mix.", True, "2026-03-20", "https://dpsigurgaon.com", "+91-124-481-6000"),
    ("Amity International School Gurgaon", "Sector 46, Gurgaon", "CBSE", 130000, 230000, 4.3, 96.0, 1567, 2003, ["sports","music","digital","library"], "Part of Amity group with modern Gurgaon campus.", True, "2026-03-22", "https://amitygurgaon.com", "+91-124-401-4400"),
    ("Lancers International School", "Sector 53, Gurgaon", "IGCSE & IB", 800000, 1300000, 4.6, 97.9, 487, 2002, ["sports","music","digital","drama","swimming","library","art"], "International school with British curriculum and global outlook.", True, "2026-03-12", "https://lancersinternational.in", "+91-124-401-1234"),
    ("The Shri Ram Millennium School", "Sector 27, Gurgaon", "CBSE", 280000, 490000, 4.5, 97.5, 612, 2009, ["sports","music","digital","drama","library","art"], "Co-ed CBSE school in TSRS family with progressive pedagogy.", True, "2026-03-18", "https://tsrms.org", "+91-124-462-2222"),
    ("Suncity School", "Sector 54, Gurgaon", "CBSE & IGCSE", 220000, 410000, 4.4, 96.8, 723, 2003, ["sports","music","digital","drama","library"], "Modern Gurgaon school with international curriculum option.", True, "2026-03-25", "https://suncityschool.in", "+91-124-417-6666"),
    ("Pathways School Gurgaon", "Baliawas, Gurgaon", "IB & IGCSE", 950000, 1500000, 4.7, 98.1, 456, 2010, ["sports","music","digital","drama","swimming","library","art"], "Day campus of Pathways with strong IB program.", True, "2026-03-02", "https://pathways.in", "+91-124-451-8888"),
]


def _build(rows, city, start_idx):
    out = []
    for i, r in enumerate(rows):
        name, area, board, fees_min, fees_max, rating, pct, reviews, est, facilities, desc, open_, deadline, app_url, phone = r
        out.append({
            "name": name,
            "city": city,
            "area": area,
            "board": board,
            "fees_min": fees_min,
            "fees_max": fees_max,
            "rating": rating,
            "google_reviews_count": reviews,
            "pass_percentage_10th": pct,
            "established": est,
            "facilities": facilities,
            "image": _img(start_idx + i),
            "description": desc,
            "admission_open": open_,
            "admission_deadline": deadline,
            "application_url": app_url,
            "phone": phone,
        })
    return out


MUMBAI_SCHOOLS = (
    _build(MUMBAI_RAW, "Mumbai", 0)
    + _build(BANGALORE_RAW, "Bangalore", 7)
    + _build(DELHI_RAW, "Delhi", 3)
    + _build(NOIDA_RAW, "Noida", 5)
    + _build(GURGAON_RAW, "Gurgaon", 1)
)
