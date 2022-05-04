import express from 'express';

import { OrderService } from '../../modules/order/order.service';
import { CourierService } from '../../modules/courier/courier.service';

const router = express.Router();

// /:id/orders?queryParams - if we want to filter orders no only by status
router.get('/:id/orders/current', async (req, res, next) => { s
    try {
        const courierId = req.params.id;
        // implementation migh depend on DB type: SQL or noSQL and how many Db calls we nned to make
        // with SQL DB it might be better to have a one DB call to get order object
        // with noSQL we may want to have 2 separate calls for courier and order from 2 services
        const orderId = await CourierService.getLastOrderId(courierId);
        const order = await OrderService.getById(orderId);

        return order.status === ORDER_STATUS_ENUM.IN_PROGRESS
            ? res.json({ order })
            : res.status(404).send(`no orders in progress for the courierId ${courierId}`);
    } catch (err) {
        return next(err);
    }
});

router.put('/:id/profile/picture', async (req, res, next) => {
    try {
        const courierId = req.params.id;

        // ...
        // after somehow getting file buffer
        const buffer = req.fileBuffer;

        // use streams?
        await CourierService.uploadPhotoToS3(courierId, buffer);
        
        // might be return an URL to the uploaded photo?
        return res.json({ status: true });
    } catch (err) {
        return next(err);
    }
});

export default router;
