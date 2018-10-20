<?php

namespace ofixone\filekit;

use yii\base\InvalidConfigException;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\helpers\Json;
use yii\helpers\Url;
use yii\jui\JuiAsset;

class Upload extends \trntv\filekit\widget\Upload
{
    public $cropUrl;
    public $alt;
    public $title;
    public $quality = 90;

    public function init()
    {
        parent::init();
        $this->registerMessages();

        if ($this->maxNumberOfFiles > 1 || $this->multiple) {
            $this->multiple = true;
        }
        if ($this->hasModel()) {
            $this->name = $this->name ?: Html::getInputName($this->model, $this->attribute);
            $this->value = $this->value ?: Html::getAttributeValue($this->model, $this->attribute);
        }
        if (!array_key_exists('name', $this->clientOptions)) {
            $this->clientOptions['name'] = $this->name;
        }
        if ($this->multiple && $this->value && !is_array($this->value)) {
            throw new InvalidConfigException('In "multiple" mode, value must be an array.');
        }
        if (!array_key_exists('fileparam', $this->url)) {
            $this->url['fileparam'] = $this->getFileInputName();
        }
        if (!$this->files && $this->value) {
            $this->files = $this->multiple ? $this->value : [$this->value];
        }

        $this->clientOptions = ArrayHelper::merge(
            [
                'url' => Url::to($this->url),
                'cropUrl' => Url::to($this->cropUrl),
                'multiple' => $this->multiple,
                'sortable' => $this->sortable,
                'maxNumberOfFiles' => $this->maxNumberOfFiles,
                'maxFileSize' => $this->maxFileSize,
                'minFileSize' => $this->minFileSize,
                'acceptFileTypes' => $this->acceptFileTypes,
                'previewImage' => $this->previewImage,
                'showPreviewFilename' => $this->showPreviewFilename,
                'pathAttribute' => 'path',
                'baseUrlAttribute' => 'base_url',
                'pathAttributeName' => 'path',
                'baseUrlAttributeName' => 'base_url',
                'alt' => $this->alt,
                'title' => $this->title,
                'messages' => [
                    'maxNumberOfFiles' => \Yii::t($this->messagesCategory, 'Maximum number of files exceeded'),
                    'acceptFileTypes' => \Yii::t($this->messagesCategory, 'File type not allowed'),
                    'maxFileSize' => \Yii::t($this->messagesCategory, 'File is too large'),
                    'minFileSize' => \Yii::t($this->messagesCategory, 'File is too small')
                ]
            ],
            $this->clientOptions
        );
    }

    /**
     * Registers required script for the plugin to work as jQuery File Uploader
     */
    public function registerClientScript()
    {
        UploadAsset::register($this->getView());
        $options = Json::encode($this->clientOptions);
        if ($this->sortable) {
            JuiAsset::register($this->getView());
        }
        $this->getView()->registerJs("jQuery('#{$this->getId()}').yiiUploadKit({$options});");
    }
}