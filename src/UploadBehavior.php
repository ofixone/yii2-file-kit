<?php
/**
 * Created by PhpStorm.
 * User: oFix
 * Date: 019 19.10.18
 * Time: 20:53
 */

namespace ofixone\filekit;


use yii\db\ActiveRecord;

class UploadBehavior extends \trntv\filekit\behaviors\UploadBehavior
{
    public $altAttribute;
    public $titleAttribute;
	public $searchRoute = 'admin';

    /**
     * @return array
     */
    public function fields()
    {
        $fields = [
            $this->attributePathName ? : 'path' => $this->pathAttribute,
            $this->attributeBaseUrlName ? : 'base_url' => $this->baseUrlAttribute,
            'type' => $this->typeAttribute,
            'size' => $this->sizeAttribute,
            'name' => $this->nameAttribute,
            'order' => $this->orderAttribute
        ];
        if(!empty($this->altAttribute)) {
            $fields['alt'] = $this->altAttribute;
        }
        if(!empty($this->titleAttribute)) {
            $fields['title'] = $this->titleAttribute;
        }

        if ($this->attributePrefix !== null) {
            $fields = array_map(function ($fieldName) {
                return $this->attributePrefix . $fieldName;
            }, $fields);
        }

        return $fields;
    }

    /**
     * @return array
     */
    public function events()
    {
        $multipleEvents = [
            ActiveRecord::EVENT_AFTER_INSERT => 'afterInsertMultiple',
            ActiveRecord::EVENT_AFTER_UPDATE => 'afterUpdateMultiple',
            ActiveRecord::EVENT_BEFORE_DELETE => 'beforeDeleteMultiple',
            ActiveRecord::EVENT_AFTER_DELETE => 'afterDelete',
        ];

        $singleEvents = [
            ActiveRecord::EVENT_AFTER_VALIDATE => 'afterValidateSingle',
            ActiveRecord::EVENT_BEFORE_UPDATE => 'beforeUpdateSingle',
            ActiveRecord::EVENT_AFTER_UPDATE => 'afterUpdateSingle',
            ActiveRecord::EVENT_BEFORE_DELETE => 'beforeDeleteSingle',
            ActiveRecord::EVENT_AFTER_DELETE => 'afterDelete',
        ];

        if(strrpos(\Yii::$app->controller->route, $this->searchRoute) !== false) {
            $multipleEvents[ActiveRecord::EVENT_AFTER_FIND] = 'afterFindMultiple';
            $singleEvents[ActiveRecord::EVENT_AFTER_FIND] = 'afterFindSingle';
        }

        return $this->multiple ? $multipleEvents : $singleEvents;
    }
}