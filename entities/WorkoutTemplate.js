{
  "name": "WorkoutTemplate",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Nom du programme (Push A, Pull B, etc.)"
    },
    "description": {
      "type": "string",
      "description": "Description du programme"
    },
    "color": {
      "type": "string",
      "description": "Couleur du programme"
    },
    "exercises": {
      "type": "array",
      "description": "Liste des exercices du template",
      "items": {
        "type": "object",
        "properties": {
          "exercise_id": {
            "type": "string"
          },
          "exercise_name": {
            "type": "string"
          },
          "muscle_group": {
            "type": "string"
          },
          "equipment": {
            "type": "string"
          },
          "target_sets": {
            "type": "number"
          },
          "target_reps": {
            "type": "number"
          },
          "target_rest": {
            "type": "number"
          }
        }
      }
    },
    "estimated_duration": {
      "type": "number",
      "description": "Dur\u00e9e estim\u00e9e en minutes"
    }
  },
  "required": [
    "name"
  ]
}