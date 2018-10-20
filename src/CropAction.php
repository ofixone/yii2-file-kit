<?php

namespace ofixone\filekit;

use trntv\filekit\actions\BaseAction;
use yii\base\Action;
use Yii;
use yii\helpers\ArrayHelper;
use yii\web\BadRequestHttpException;
use yii\imagine\Image;

class CropAction extends BaseAction
{
    public function runWithParams($params)
    {
        $errors = [];
        $post = ArrayHelper::htmlEncode(Yii::$app->request->post());
        if (empty($post['images'])) {
            throw new BadRequestHttpException();
        }
        foreach ($post['images'] as $params) {
            try {
                Image::crop(
                    $this->getFileStorage()->getFilesystem()->readStream($params['path']),
                    intval($params['width']),
                    intval($params['height']),
                    [$params['x'], $params['y']]
                )->save();
            } catch (\Throwable $exception) {
                $errors[$params['path']] = $exception->getMessage();
                continue;
            }
        }
        return Yii::$app->controller->asJson([
            'status' => true, 'errors' => $errors
        ]);
    }
}