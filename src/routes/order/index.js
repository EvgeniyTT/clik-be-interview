import express from 'express';

import { OrderService } from '../../modules/order/order.service';
import { CourierService } from '../../modules/courier/courier.service';

const router = express.Router();

router.get('/:id', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await OrderService.getById(orderId);
        return order 
            ? res.json({ order })
            : res.status(404).send(`No orders found by id: ${orderId}`);
    } catch (err) {
        return next(err);
    }
});

router.post('/:id/courier/assign', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await OrderService.getById(orderId);
        if(order?.status !== ORDER_STATUS_ENUM.READY_TO_PICKUP) {
            throw new Error (`order ${orderId} is not ready to be picked up, order status is ${order?.status}`);
        }

        const courier = await CourierService.getCouriers({
            location: order.location,
            rating: COURIER_RATING_ENUM.GOOD,
            status: COURIER_STATUS_ENUM.FREE,
            limit: 1,
        });
        if (!courier) {
            throw new Error (`no available couriers within the order ${orderId} location ${order.location}`);
        }

        await OrderService.assignCourier(courier);
        
        return res.json({ status: !!courier, courier });
    } catch (err) {
        return next(err);
    }
});

// route with some integration logic
router.get('/:id/integration/check', async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const statusesArr = await OrderService.checkIntegrationStatus(orderId);

        return res.json({ res: statusesArr });
    } catch (err) {
        return next(err);
    }
});

export default router;
