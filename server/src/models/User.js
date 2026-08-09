const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 50,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})$/,
                "Please enter a valid email",
            ],
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["candidate", "recruiter", "admin"],
            default: "candidate",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            default: "",
            select: false,
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },

        resetPasswordExpire: {
            type: Date,
            select: false,
        },

        profile: {
            bio: {
                type: String,
                default: "",
                trim: true,
            },

            phone: {
                type: String,
                default: "",
                trim: true,
            },

            location: {
                type: String,
                default: "",
                trim: true,
            },

            skills: [
                {
                    type: String,
                    trim: true,
                },
            ],

            experience: {
                type: Number,
                default: 0,
                min: 0,
            },

            education: {
                type: String,
                default: "",
                trim: true,
            },

            college: {
                type: String,
                default: "",
                trim: true,
            },

            currentCompany: {
                type: String,
                default: "",
                trim: true,
            },

            currentPosition: {
                type: String,
                default: "",
                trim: true,
            },

            linkedin: {
                type: String,
                default: "",
                trim: true,
            },

            github: {
                type: String,
                default: "",
                trim: true,
            },

            portfolio: {
                type: String,
                default: "",
                trim: true,
            },

            resume: {
                url: {
                    type: String,
                    default: "",
                },

                publicId: {
                    type: String,
                    default: "",
                },

                fileName: {
                    type: String,
                    default: "",
                },

                uploadedAt: {
                    type: Date,
                },
            },
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Hash password before saving
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);

});

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
