// Base de données des produits
const products = [
    {
        id: 1,
        name: "Panier tressé traditionnel",
        price: 150000,
        category: "artisanat",
        description: "Panier tressé à la main par des artisans de Kindia, utilisant des techniques traditionnelles transmises de génération en génération. Parfait pour le rangement ou comme élément décoratif.",
        image: "artisanat/35.png",
        vendor: "Artisanat Kindia",
        contact: "224XXXXXXX1"
    },
    {
        id: 2,
        name: "Miel de forêt guinéen",
        price: 75000,
        category: "alimentaire",
        description: "Miel 100% naturel récolté dans les forêts de la Guinée Forestière. Non pasteurisé et sans additifs, ce miel conserve toutes ses propriétés nutritionnelles et médicinales.",
        image: "artisanat/39.png",
        vendor: "Coopérative Apicole de N'Zérékoré",
        contact: "224XXXXXXX2"
    },
    {
        id: 3,
        name: "Beurre de karité naturel",
        price: 50000,
        category: "beaute",
        description: "Beurre de karité pur et naturel, fabriqué artisanalement par des femmes de Haute Guinée. Excellent pour hydrater la peau et les cheveux, avec des propriétés anti-inflammatoires.",
        image: "artisanat/39.png",
        vendor: "Femmes Solidaires de Kankan",
        contact: "224XXXXXXX3"
    },
    {
        id: 4,
        name: "Boubou traditionnel brodé",
        price: 350000,
        category: "textile",
        description: "Boubou traditionnel guinéen en coton de haute qualité avec broderies artisanales. Chaque pièce est unique et témoigne du savoir-faire des tailleurs locaux.",
        image: "artisanat/9.png",
        vendor: "Atelier Conakry Mode",
        contact: "224XXXXXXX4"
    },
    {
        id: 5,
        name: "Collier en perles de bauxite",
        price: 85000,
        category: "accessoires",
        description: "Collier artisanal fabriqué à partir de perles de bauxite, la principale ressource minière de la Guinée. Un bijou unique qui allie tradition et modernité.",
        image: "artisanat/5.png",
        vendor: "Bijoux Bauxite",
        contact: "224XXXXXXX5"
    },
    {
        id: 6,
        name: "Sculpture en bois de Kapokier",
        price: 250000,
        category: "artisanat",
        description: "Sculpture traditionnelle en bois de Kapokier représentant une scène de la vie quotidienne guinéenne. Chaque pièce est sculptée à la main et unique.",
        image: "artisanat/7.png",
        vendor: "Artisans de Fouta",
        contact: "224XXXXXXX6"
    },
    {
        id: 7,
        name: "Café arabica de Macenta",
        price: 45000,
        category: "alimentaire",
        description: "Café arabica cultivé en altitude dans la région de Macenta. Torréfié artisanalement pour préserver ses arômes fruités et sa légère acidité.",
        image: "artisanat/39.png",
        vendor: "Coopérative des Caféiculteurs",
        contact: "224XXXXXXX7"
    },
    {
        id: 8,
        name: "Huile de coco bio",
        price: 65000,
        category: "beaute",
        description: "Huile de coco 100% naturelle et bio, pressée à froid pour conserver toutes ses propriétés. Idéale pour les soins de la peau et des cheveux.",
        image: "artisanat/39.png",
        vendor: "Naturel Guinée",
        contact: "224XXXXXXX8"
    },
    {
        id: 9,
        name: "Pagne tissé Foutanien",
        price: 120000,
        category: "textile",
        description: "Pagne traditionnel tissé à la main dans la région du Fouta Djallon. Les motifs géométriques représentent des symboles culturels importants.",
        image: "artisanat/14.png",
        vendor: "Tisserands du Fouta",
        contact: "224XXXXXXX9"
    },
    {
        id: 10,
        name: "Bracelet en cuivre recyclé",
        price: 35000,
        category: "accessoires",
        description: "Bracelet artisanal fabriqué à partir de cuivre recyclé. Chaque pièce est martelée à la main et présente des motifs inspirés de l'art guinéen.",
        image: "artisanat/31.png",
        vendor: "Artisanat Durable",
        contact: "224XXXXXXX10"
    },
    {
        id: 11,
        name: "Masque cérémoniel Kissi",
        price: 300000,
        category: "artisanat",
        description: "Masque traditionnel Kissi utilisé lors des cérémonies importantes. Sculpté à la main dans du bois dur et décoré avec des pigments naturels.",
        image: "artisanat/11.png",
        vendor: "Héritage Culturel Guinéen",
        contact: "224XXXXXXX11"
    },
    {
        id: 12,
        name: "Jus de gingembre naturel",
        price: 25000,
        category: "alimentaire",
        description: "Jus de gingembre frais préparé selon une recette traditionnelle guinéenne. Sans conservateurs ni colorants, avec juste ce qu'il faut de sucre de canne local.",
        image: "artisanat/10.png",
        vendor: "Saveurs de Guinée",
        contact: "224XXXXXXX12"
    },
    {
        id: 13,
        name: "Savon noir traditionnel",
        price: 20000,
        category: "beaute",
        description: "Savon noir fabriqué artisanalement à partir d'ingrédients naturels locaux. Excellent pour exfolier et purifier la peau en profondeur.",
        image: "artisanat/15.png",
        vendor: "Cosmétiques Naturels Guinée",
        contact: "224XXXXXXX13"
    },
    {
        id: 14,
        name: "Écharpe en coton bio",
        price: 70000,
        category: "textile",
        description: "Écharpe tissée à la main en coton bio cultivé en Guinée. Les teintures naturelles utilisées sont issues de plantes locales.",
        image: "artisanat/13.png",
        vendor: "Tissage Écologique",
        contact: "224XXXXXXX14"
    },
    {
        id: 15,
        name: "Boucles d'oreilles en corne",
        price: 45000,
        category: "accessoires",
        description: "Boucles d'oreilles élégantes fabriquées à partir de corne de zébu recyclée. Chaque paire est unique avec ses propres motifs naturels.",
        image: "artisanat/10.png",
        vendor: "Bijoux Éthiques",
        contact: "224XXXXXXX15"
    },
    {
        id: 16,
        name: "Tam-tam djembé",
        price: 450000,
        category: "artisanat",
        description: "Authentique djembé guinéen fabriqué par des maîtres artisans. La caisse est sculptée dans un tronc de bois massif et la peau est tendue à la main.",
        image: "artisanat/25.png",
        vendor: "Percussions de Guinée",
        contact: "224XXXXXXX16"
    }
];
