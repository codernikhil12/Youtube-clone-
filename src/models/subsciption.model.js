import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing user
        ref: 'User'
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom subscriber is subscribing 
        ref: 'User'
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)


// amera jakhan kno channal ke subscribe korbo takhan database a new kore akta document create hbe  

// subscibers found 
// amader  channal find korte hbe jader name same and segulo ke count korte hbe 

// akta user kon kon channal subscribed kore seta found korte hbe (channal found)
// akjon subscribers je channal gulo subscribed kore rekheche segulo find korte hbe and value gulo sum korte hbe 