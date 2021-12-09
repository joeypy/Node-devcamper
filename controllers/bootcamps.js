const ErrorResponse = require('./../utils/errorResponse')
const asyncHandler = require('./../middleware/async')
const Bootcamp = require('./../models/Bootcamp')
const geocoder = require('../utils/geocoder')



// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getAllBootcamps = asyncHandler( async (req, res, next) => {
    let query
    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'limit', 'page']

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach( param => delete reqQuery[param])

    // Create query String
    let queryStr = JSON.stringify(reqQuery)

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b((gt|gte|lt|lte|in))\b/g, match => `$${match}`)

    // Finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort Fields
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 25
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments()

    query = query.skip(startIndex).limit(limit)

    // Executing query
    const bootcamps = await query

    // Pagination result
    const pagination = {}
    if(startIndex> 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    
    res
      .status(200)
      .json({ 
          success: true, 
          count: bootcamps.length,
          pagination: pagination, 
          data: bootcamps 
        })
})




// @desc        Get simple bootcamp
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not fount with id of ${req.params.id}`, 404))
    }
    res.status(200).json({
        success: true, 
        data: bootcamp
    })
})




// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      Private
exports.postBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success: true, 
        data: bootcamp
    })    
})




// @desc        Update bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not fount with id of ${req.params.id}`, 404))
    }
    res.status(200).json({success: true, data: bootcamp})
})




// @desc        Delete bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not fount with id of ${req.params.id}`, 404))
    }
    bootcamp.remove()
    res.status(200).json({success: true, data: {} })
})




// @desc        Get bootcamps within a radius
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      Private
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {
    const { zipcode, distance } = req.params

    // Get lat/lng rom geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3.963 milles / 6.378 Km
    const radius = distance / 3963

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ]} }
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })

})