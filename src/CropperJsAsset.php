<?php

namespace ofixone\filekit;

use yii\web\AssetBundle;

class CropperJsAsset extends AssetBundle
{
    public $sourcePath = '@npm/cropperjs/dist';

    public $css = [
        'cropper.min.css'
    ];

    public $js = [
        'cropper.min.js'
    ];
}