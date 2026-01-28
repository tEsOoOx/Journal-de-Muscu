{
  "name": "Workout",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nom de la s\u00e9ance (Push, Pull, Legs...)"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date de la s\u00e9ance"
    },
    "start_time": {
      "type": "string",
      "description": "Heure de d\u00e9but"
    },
    "end_time": {
      "type": "string",
      "description": "Heure de fin"
    },
    "duration_minutes": {
      "type": "number",
      "description": "Dur\u00e9e totale en minutes"
    },
    "exercises": {
      "type": "array",
      "description": "Liste des exercices de la s\u00e9ance",
      "items": {
        "type": "object",
        "properties": {
          "exercise_id": {
            "type": "string"
          },
          "exercise_name": {
            "type": "string"
          },
          "sets": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "weight": {
                  "type": "number"
                },
                "reps": {
                  "type": "number"
                },
                "rest_seconds": {
                  "type": "number"
                },
                "completed": {
                  "type": "boolean"
                }
              }
            }
          }
        }
      }
    },
    "notes": {
      "type": "string",
      "description": "Notes sur la s\u00e9ance"
    },
    "is_completed": {
      "type": "boolean",
      "default": false
    },
    "total_volume": {
      "type": "number",
      "description": "Volume total (poids x reps)"
    }
  },
  "required": [
    "name",
    "date"
  ]
}