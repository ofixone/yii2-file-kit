<?php
/**
 * Created by PhpStorm.
 * User: oFix
 * Date: 019 19.10.18
 * Time: 21:12
 */

namespace ofixone\filekit;

use yii\imagine\Image;
use Yii;

class UploadAction extends \trntv\filekit\actions\UploadAction
{
    public function init()
    {
        parent::init();
        $this->on(self::EVENT_AFTER_SAVE, function ($event) {
            /* @var $file \League\Flysystem\File */
            $file = $event->file;
            $type = $file->getMimetype();
            if (explode('/', $type)[0] == 'image' && $type != 'image/svg+xml' && $type != 'image/svg')
                Image::thumbnail(
                    $file->readStream(), 1920, null)
                    ->save(null, [
                        'jpeg_quality' => Yii::$app->request->get('quality', 90),
                        'png_compression_level' => round((9 / 100) * Yii::$app->request->get('quality', 90))
                    ]);
        });
    }
}