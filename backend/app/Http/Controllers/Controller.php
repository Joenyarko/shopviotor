<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="Viotor Marketplace API",
 *      description="REST API documentation for the Viotor marketplace platform.",
 *      @OA\Contact(
 *          email="support@viotor.com"
 *      ),
 *      @OA\License(
 *          name="Proprietary",
 *          url="https://viotor.com"
 *      )
 * )
 *
 * @OA\Server(
 *      url=L5_SWAGGER_CONST_HOST,
 *      description="API Server"
 * )
 *
 * @OA\SecurityScheme(
 *      securityScheme="bearerAuth",
 *      in="header",
 *      name="bearerAuth",
 *      type="http",
 *      scheme="bearer",
 *      bearerFormat="JWT",
 * )
 */
abstract class Controller
{
    //
}
