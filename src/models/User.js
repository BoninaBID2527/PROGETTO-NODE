const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Lo username è obbligatorio'],
      trim: true,
      minlength: [3, 'Lo username deve avere almeno 3 caratteri'],
      maxlength: [30, 'Lo username può avere al massimo 30 caratteri'],
    },
    email: {
      type: String,
      required: [true, "L'email è obbligatoria"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email non valida'],
    },
    password: {
      type: String,
      required: [true, 'La password è obbligatoria'],
      minlength: [6, 'La password deve avere almeno 6 caratteri'],
      select: false, // non viene restituita nelle query, salvo richiesta esplicita
    },
  },
  { timestamps: true }
);

// Prima del salvataggio la password viene sostituita dal suo hash
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Nelle risposte JSON non deve mai comparire la password
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
