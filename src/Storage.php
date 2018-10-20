<?php

namespace ofixone\filekit;

use ofixone\filekit\components\LocalFlysystemBuilder;

class Storage extends \trntv\filekit\Storage
{
    public $baseUrl = '/uploads';
    public $maxDirFiles = 100;
    public $filesystem = [
        'class' => LocalFlysystemBuilder::class,
        'path' => '@webroot/uploads'
    ];
}