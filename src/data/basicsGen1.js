export const POKEMON_BASIC = [
  {
    id: 1,
    enName: "Bulbasaur",
    koName: "이상해씨",
    types: ["Grass", "Poison"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    category: "씨앗포켓몬",
    evolution: [
      { id: 1, level: null },
      { id: 2, level: 16 },
      { id: 3, level: 32 },
    ],
    stats: {
      hp: 45,
      atk: 49,
      def: 49,
      spAtk: 65,
      spDef: 65,
      speed: 45,
    },
    abilities: [
      {
        name: "심록",
        description: "HP가 ⅓ 이하일 때 풀 타입 기술의 위력이 1.5배가 된다.",
      },
      {
        name: "엽록소",
        description: "날씨가 쾌청 상태일 때 스피드가 2배가 된다.",
      },
    ],
    dexEntries: [
      {
        versionId: "red",
        versionLabel: "레드/그린/FR·소드",
        description:
          "태어났을 때부터 등에 식물의 씨앗이 있으며 조금씩 크게 자란다.",
      },
      {
        versionId: "blue",
        versionLabel: "블루/LG·X·PLZ",
        description:
          "태어났을 때부터 등에 이상한 씨앗이 심어져 있으며 몸과 함께 자란다고 한다.",
      },
      {
        versionId: "let",
        versionLabel: "피카츄·레츠고! 피카츄/이브이",
        description:
          "며칠 동안 아무것도 먹지 않아도 건강하다! 등에 있는 씨앗에는 많은 영양분이 있어서 문제없다!",
      },
      {
        versionId: "gold",
        versionLabel: "금/HG",
        description:
          "등의 씨앗 안에는 영양이 가득하다. 씨앗은 몸과 함께 커진다.",
      },
      {
        versionId: "silver",
        versionLabel: "은/SS·바이올렛",
        description:
          "태어날 때부터 등에 씨앗을 짊어지고 있다. 몸이 크게 성장함에 따라 씨앗도 커진다.",
      },
      {
        versionId: "crystal",
        versionLabel: "크리스탈·실드·스칼렛",
        description:
          "태어나서 얼마 동안 등의 씨앗에 담긴 영양을 섭취하며 자란다.",
      },
      {
        versionId: "rs",
        versionLabel: "RSE·ORAS·Pokemon GO",
        description:
          "양지에서 낮잠 자는 모습을 볼 수 있다. 태양의 빛을 많이 받으면 등의 씨앗이 크게 자란다.",
      },
      {
        versionId: "dp",
        versionLabel: "DPPt/BDSP·BW/BW2·Y",
        description:
          "태어나서부터 얼마 동안은 등의 씨앗으로부터 영양을 공급받아서 크게 성장한다.",
      },
    ],

    // 기술
    levelUpMoves: [
      {
        level: 1,
        moveKo: "몸통박치기",
        moveEn: "Tackle",
        type: "Normal",
        categoryKo: "물리",
        power: 40,
        accuracy: 100,
      },
      {
        level: 3,
        moveKo: "울음소리",
        moveEn: "Growl",
        type: "Normal",
        categoryKo: "변화",
        power: null,
        accuracy: 100,
      },
      {
        level: 7,
        moveKo: "덩굴채찍",
        moveEn: "Vine Whip",
        type: "Grass",
        categoryKo: "물리",
        power: 45,
        accuracy: 100,
      },
      {
        level: 9,
        moveKo: "독가루",
        moveEn: "Poison Powder",
        type: "Poison",
        categoryKo: "변화",
        power: null,
        accuracy: 75,
      },
      {
        level: 13,
        moveKo: "씨뿌리기",
        moveEn: "Leech Seed",
        type: "Grass",
        categoryKo: "변화",
        power: null,
        accuracy: 90,
      },
      {
        level: 15,
        moveKo: "성장",
        moveEn: "Growth",
        type: "Normal",
        categoryKo: "변화",
        power: null,
        accuracy: null,
      },
      {
        level: 19,
        moveKo: "잎날가르기",
        moveEn: "Razor Leaf",
        type: "Grass",
        categoryKo: "물리",
        power: 55,
        accuracy: 95,
      },
      {
        level: 21,
        moveKo: "수면가루",
        moveEn: "Sleep Powder",
        type: "Grass",
        categoryKo: "변화",
        power: null,
        accuracy: 75,
      },
    ],
  },
  {
    id: 2,
    enName: "Ivysaur",
    koName: "이상해풀",
    types: ["Grass", "Poison"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
    category: "씨앗포켓몬",
    evolution: [
      { id: 1, level: null },
      { id: 2, level: 16 },
      { id: 3, level: 32 },
    ],
  },
  {
    id: 3,
    enName: "Venusaur",
    koName: "이상해꽃",
    types: ["Grass", "Poison"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
    category: "씨앗포켓몬",
    evolution: [
      { id: 1, level: null },
      { id: 2, level: 16 },
      { id: 3, level: 32 },
    ],
  },
  {
    id: 4,
    enName: "Charmander",
    koName: "파이리",
    types: ["Fire"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
    category: "도롱뇽포켓몬",
  },
  {
    id: 7,
    enName: "Squirtle",
    koName: "꼬부기",
    types: ["Water"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
    category: "꼬마거북포켓몬",
  },
  {
    id: 25,
    enName: "Pikachu",
    koName: "피카츄",
    types: ["Electric"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    category: "쥐포켓몬",
  },
  {
    id: 39,
    enName: "Jigglypuff",
    koName: "푸린",
    types: ["Normal", "Fairy"],
    imageUrl:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
    category: "풍선포켓몬",
  },
];

export const POKEMON_TYPES = [
  "All",
  "Normal",
  "Fire",
  "Water",
  "Grass",
  "Electric",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

export const TYPE_LABELS_KO = {
  Grass: "풀",
  Poison: "독",
  Fire: "불꽃",
  Water: "물",
  Electric: "전기",
  Normal: "노말",
  Fairy: "페어리",
  Ice: "얼음",
  Fighting: "격투",
  Psychic: "에스퍼",
  Dragon: "드래곤",
  Ghost: "고스트",
  Dark: "악",
  Ground: "땅",
  Flying: "비행",
  Rock: "바위",
  Bug: "벌레",
  Steel: "강철",
};
