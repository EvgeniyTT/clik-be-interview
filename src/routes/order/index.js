import express from 'express';

import { OrderService } from '../../modules/order/order.service';

const router = express.Router();

// TODO:
//  1. rename route to /orders/:id
//  2. Add 404 handling
router.get('/getById/:id', async (req, res, next) => {
    try {
        const orderId = req.params.id;

        // TODO: what if order is missing? Please return 404 error
        const order = await OrderService.getById(orderId);
        return res.json({ order });
    } catch (err) {
        return next(err);
    }
});

// TODO: Rename route to /orders/:id/assign-courier
router.post('/courier/assign/:id', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const courierId = await OrderService.assignNearestCourier(orderId);
        // TODO: Move status to http, add error handling
        return res.json({ status: Boolean(courierId), courierId });
    } catch (err) {
        return next(err);
    }
});

// TODO: Not clear what it is. I think that we need to change HTTP method to get and name route appropriate.
// route with some integration logic
router.post('/integration/check/:id', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const statusesArr = await OrderService.checkIntegrationStatus(orderId);

        return res.json({ res: statusesArr });
    } catch (err) {
        return next(err);
    }
});

export default router;
