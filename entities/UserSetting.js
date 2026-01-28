{
  "name": "UserSettings",
  "type": "object",
  "properties": {
    "weight_unit": {
      "type": "string",
      "enum": [
        "kg",
        "lbs"
      ],
      "default": "kg",
      "description": "Unit\u00e9 de poids"
    },
    "default_rest_seconds": {
      "type": "number",
      "default": 90,
      "description": "Temps de repos par d\u00e9faut en secondes"
    },
    "weekly_goal": {
      "type": "number",
      "default": 4,
      "description": "Objectif de s\u00e9ances par semaine"
    },
    "theme": {
      "type": "string",
      "enum": [
        "dark",
        "high_contrast"
      ],
      "default": "dark",
      "description": "Th\u00e8me de l'application"
    }
  },
  "required": []
}