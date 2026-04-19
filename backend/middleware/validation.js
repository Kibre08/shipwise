const Joi = require('joi');

const shipmentSchema = Joi.object({
    sender: Joi.string().required(),
    receiver: Joi.string().required(),
    receiverPhone: Joi.string().required(),
    item: Joi.string().required(),
    originAddress: Joi.string().required(),
    destinationAddress: Joi.string().required(),
    destinationLat: Joi.number().allow(null, '').optional(),
    destinationLng: Joi.number().allow(null, '').optional(),
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('Pre-advised', 'Received', 'Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered').required(),
    location: Joi.string().required(),
    pin: Joi.string().length(4).optional()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        next();
    };
};

module.exports = {
    shipmentSchema,
    updateStatusSchema,
    validateRequest
};
