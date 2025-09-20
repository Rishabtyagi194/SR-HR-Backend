import express from "express";

const router = express.Router();

// GET /admin/subscriptions — filter by status
router.get('/admin/subscriptions', ()=>{

})


// POST /admin/subscriptions/:id/cancel — cancel subscription
router.get('/admin/subscriptions/:id/cancel', ()=>{
    
})


// POST /admin/payments/:id/refund — issue refund
router.post('/admin/payments/:id/refund', ()=>{
    
})


export default router