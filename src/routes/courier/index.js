import express from 'express';

import { CourierService } from '../../modules/courier/courier.service';

const router = express.Router();

/**
 * TODO:
 *  1. Rename route to /couriers/:id/orders/current
 *  2. What to do in case of multiple parallel orders for a courier? (-> potential problem for scaling)
 *  3. Missing Error handling
 *  4. ? Move deps to DI, use advanced pattern like mediator
 */
router.get('/current/order/:id', async (req, res, next) => {
    try {
        const courierId = req.params.id;

        // TODO:
        //  1. Move Courier related logic from CourierService to CourierOrderService
        //  2. Rename to CourierOrderService.getCurrentOrder
        const order = await CourierService.getCurrentOrderByCourierId(courierId);
        return res.json({ order });
    } catch (err) {
        return next(err);
    }
});

/**
 * TODO:
 *  1. Change HTTP method to PUT
 *  2. Change route to /couriers/:id/profile-picture
 */
router.post('/change/profile/picture/:id', async (req, res, next) => {
    try {
        const courierId = req.params.id;

        // ...
        // after somehow getting file buffer
        const buffer = req.fileBuffer;

        // TODO:
        //   1. Move this logic out to a separate Use Case/Service
        //   2. In that service/use case we need to upload logo to s3 and bind it to appropriate courier
        //   3. What if we will migrate from s3 to file system?
        //      1. Move file related logic to a separate service
        //      2. Adjust naming
        await CourierService.uploadPhotoToS3(courierId, buffer);

        // TODO: get rid of { status: true }.
        return res.json({ status: true });
    } catch (err) {
        return next(err);
    }
});

export default router;
