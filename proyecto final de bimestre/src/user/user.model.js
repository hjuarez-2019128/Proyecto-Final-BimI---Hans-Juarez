import mongoose from "mongoose";
import bcrypt from 'bcrypt';
// Definición del esquema del usuario
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
},

  password: {
    type: String,
    required: true,
    minLength: [8, 'Password must be 8 characters'],
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    minLength: 8,
    maxLength: 8,
    required: true
}, 
role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'CLIENT'],
    default: 'CLIENT'
    
}
},
{
    versionKey: false
}
)

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};


// Modelo de usuario
export default mongoose.model('User', userSchema);


