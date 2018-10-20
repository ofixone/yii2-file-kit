<?php

namespace ofixone\filekit;

class UploadAsset extends \trntv\filekit\widget\UploadAsset
{
    public $sourcePath = __DIR__ . '/assets';

    public $css = [
       'css/upload-kit.css'
    ];

    public $js = [
        'js/upload-kit.js'
    ];

    public function init()
    {
        parent::init();
        $this->depends[] = JqueryCropperAsset::class;
    }
}