import mongoose from "mongoose";

const options = { timestamps: true, toJSON: { virtuals: true, transform: (_doc, value) => { value.id = value._id.toString(); delete value._id; delete value.__v; } } };
const fields = {
  userId: { type: String, required: true, index: true },
  title: { type: String, trim: true }, name: { type: String, trim: true },
  content: String, description: String, question: String, answer: String, mood: String,
  status: String, priority: String, dueDate: String, deadline: String, entryDate: String, plannedDate: String,
  unit: String, topic: String, url: String, type: String, notes: String, action: String, resource: String,
  current: Number, target: Number, duration: Number, confidence: Number, pinned: Boolean, completed: Boolean,
  tags: [String], steps: [mongoose.Schema.Types.Mixed], items: [mongoose.Schema.Types.Mixed],
  attachments: [mongoose.Schema.Types.Mixed]
};

function makeModel(name) {
  const schema = new mongoose.Schema(fields, options);
  schema.index({ title: "text", content: "text", description: "text" });
  return mongoose.models[name] || mongoose.model(name, schema);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: "Learner" }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, value) => {
      value.id = value._id.toString();
      delete value._id;
      delete value.__v;
      delete value.password;
    }
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export const models = {
  users: User,
  notes: makeModel("Note"), roadmaps: makeModel("Roadmap"), checklists: makeModel("Checklist"),
  topics: makeModel("Topic"), remember: makeModel("Remember"), diary: makeModel("Diary"),
  tasks: makeModel("Task"), goals: makeModel("Goal"), customModules: makeModel("CustomModule"),
  resources: makeModel("Resource"), studySessions: makeModel("StudySession"), activities: makeModel("Activity")
};

