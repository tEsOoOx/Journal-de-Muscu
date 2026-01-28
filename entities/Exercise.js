{
  "name": "Exercise",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nom de l'exercice"
    },
    "muscle_group": {
      "type": "string",
      "enum": [
        "pectoraux",
        "dos",
        "jambes",
        "epaules",
        "biceps",
        "triceps",
        "abdominaux",
        "mollets",
        "avant-bras",
        "cardio"
      ],
      "description": "Groupe musculaire cibl\u00e9"
    },
    "is_custom": {
      "type": "boolean",
      "default": false,
      "description": "Exercice personnalis\u00e9 par l'utilisateur"
    },
    "description": {
      "type": "string",
      "description": "Description de l'exercice"
    },
    "equipment": {
      "type": "string",
      "description": "\u00c9quipement n\u00e9cessaire"
    }
  },
  "required": [
    "name",
    "muscle_group"
  ]
}