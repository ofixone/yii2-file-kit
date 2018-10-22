/*!
 * Yii2 File Kit library
 * http://github.com/trntv/yii2-file-kit
 *
 * Author: Eugine Terentev <eugine@terentev.net>
 *
 * Date: 2014-05-01T17:11Z
 */
(function( $ ) {
    jQuery.fn.yiiUploadKit = function(options) {
        var $input = this;
        var $container = $input.parent('div');
        var $files = $('<ul>', {"class":"files"}).insertBefore($input);
        var $emptyInput = $container.find('.empty-value');
        options.name = $emptyInput.attr('name');

        (function cropper() {
            var chars = {};
            var activeCropper;
            var activeImage;

            var modalTemplate = '<div id="crop-modal" class="modal">' +
                '<div class="modal-dialog modal-lg">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h4>Редактирование изображения</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                '<div class="row"></div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<button class="btn btn-success" id="crop-success">Изменить</button>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            var blockTemplate = '<div class="col-sm-12">' +
                '<div class="cropper-wrap" style="width: 100%; height: 400px"></div>' +
                '</div>' +
                '<div class="col-sm-12">' +
                '<div class="row detail">' +
                '<div class="col-sm-3 X">X: <span></span></div>' +
                '<div class="col-sm-3 Y">Y: <span></span></div>' +
                '<div class="col-sm-3 width">Ширина: <span></span></div>' +
                '<div class="col-sm-3 height">Высота: <span></span></div>' +
                '</div>' +
                '</div>';


            function createModal() {
                chars = {};
                $('#crop-modal').find('.modal-body .row').html('');
                if ($('#crop-modal').length === 0) {
                    var modal = $(modalTemplate);
                    $(document.body).append(modal);
                    initCrop(modal);
                    return modal;
                } else {
                    return $('#crop-modal');
                }
            }

            function initCrop(modal) {
                $('#crop-success').off('click').click(function () {
                    //TODO: Допилить отправку на action cropper для конкретного контроллера
                    $.post({
                        url: options.cropUrl,
                        data: {
                            images: [chars]
                        }
                    }).done(function (r) {
                        var canvas = activeCropper.getCroppedCanvas();
                        activeImage.attr('src', canvas.toDataURL('image/png'));
                        modal.modal('hide');
                    }).fail(function (r) {
                        alert('Произошла ошибка при редактировании изображений. Пожалуйста, попробуйте снова или обратитесь ' +
                            'к администратору');
                    });
                });
            }

            function init(input) {
                var $input = $('input[id=' + $(input).attr('id') + ']'),
                    $itemBlock = $input.parents('.upload-kit').find('.upload-kit-item');
                $button = $(document.createElement('span')).addClass('glyphicon')
                    .addClass('glyphicon-pencil')
                    .addClass('crop-init');
                $type = $itemBlock.find('img').next().next().next().next().val();
                $itemBlock.each(function (index, element) {
                    var $element = $(element);
                    $type = $element.find('img').next().next().next().next().val();
                    if ($type != 'image/jpeg' && $type != 'image/png') {
                        return false;
                    }
                    var $currentButton = $button.clone();
                    if ($element.find('.crop-init').length === 0) {
                        $element.append($currentButton);
                        $currentButton.off().on('click', function (event) {
                            event.stopPropagation();
                            event.preventDefault();

                            var $image = $element.find('img').clone();
                            var $modal = createModal();
                            var $body = $modal.find('.modal-body .row');
                            var $block = $(blockTemplate).find('.cropper-wrap').html($image);
                            $modal.find('.modal-body .row').append(blockTemplate);
                            $modal.find('.cropper-wrap').html($block.html());
                            $image = $modal.find('.cropper-wrap img');
                            var X = $modal.find('.modal-body').find('.X span');
                            var Y = $modal.find('.modal-body').find('.Y span');
                            var width = $modal.find('.modal-body').find('.width span');
                            var height = $modal.find('.modal-body').find('.height span');
                            var path = $element.find('img').next().val();
                            $image.cropper({
                                crop: function (event) {
                                    X.html(event.detail.x.toFixed(2));
                                    Y.html(event.detail.y.toFixed(2));
                                    width.html(event.detail.width.toFixed(2));
                                    height.html(event.detail.height.toFixed(2));
                                    chars = {
                                        path: path,
                                        width: event.detail.width,
                                        height: event.detail.height,
                                        x: event.detail.x,
                                        y: event.detail.y
                                    };
                                }
                            });
                            activeImage = $element.find('img');
                            activeCropper = $image.data('cropper');

                            $modal.modal('show');

                            return false;
                        });
                    }
                });
            }

            setTimeout(function () {
                $(document).on('upload:done', function (event, input) {
                    init(input);
                });
                $('.upload-kit-input input').each(function (index, element) {
                    init(element);
                });
            }, 100);
        })();

        var methods = {
            init: function(){
                if (options.multiple) {
                    $input.attr('multiple', true);
                    $input.attr('name', $input.attr('name') + '[]');
                }
                $container.addClass('upload-kit');
                if (options.sortable) {
                    $files.sortable({
                        placeholder: "upload-kit-item sortable-placeholder",
                        tolerance: "pointer",
                        forcePlaceholderSize: true,
                        update: function () {
                            methods.updateOrder()
                        }
                    })
                }
                $input.wrapAll($('<li class="upload-kit-input"></div>'))
                    .after($('<span class="glyphicon glyphicon-plus-sign add"></span>'))
                    .after($('<span class="glyphicon glyphicon-circle-arrow-down drag"></span>'))
                    .after($('<span/>', {"data-toggle":"popover", "class":"glyphicon glyphicon-exclamation-sign error-popover"}))
                    .after(
                    '<div class="progress">'+
                    '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>'+
                    '</li>'
                );
                $files.on('click', '.upload-kit-item .remove', methods.removeItem);
                methods.checkInputVisibility();
                methods.fileuploadInit();
                methods.dragInit();
                if (options.acceptFileTypes && !(options.acceptFileTypes instanceof RegExp)) {
                    options.acceptFileTypes = new RegExp(eval(options.acceptFileTypes))
                }

            },
            fileuploadInit: function(){
                var $fileupload = $input.fileupload({
                    name: options.name || 'file',
                    url: options.url,
                    dropZone: $input.parents('.upload-kit-input'),
                    dataType: 'json',
                    singleFileUploads: false,
                    multiple: options.multiple,
                    maxNumberOfFiles: options.maxNumberOfFiles,
                    maxFileSize: options.maxFileSize, // 5 MB
                    acceptFileTypes: options.acceptFileTypes,
                    minFileSize: options.minFileSize,
                    messages: options.messages,
                    process: true,
                    getNumberOfFiles: methods.getNumberOfFiles,
                start: function (e, data) {
                        $container.find('.upload-kit-input')
                                .removeClass('error')
                                .addClass('in-progress');
                        $input.trigger('start');
                        if (options.start !== undefined) options.start(e, data);
                    },
                    processfail: function(e, data) {
                        if (data.files.error) {
                            methods.showError(data.files[0].error);
                        }
                    },
                    progressall: function (e, data) {
                        var progress = parseInt(data.loaded / data.total * 100, 10);
                        $container.find('.progress-bar').attr('aria-valuenow', progress).css(
                            'width',
                            progress + '%'
                        ).text(progress + '%');
                    },
                    done: function (e, data) {
                        $.each(data.result.files, function (index, file) {
                            if (!file.error) {
                                var item = methods.createItem(file);
                                item.appendTo($files);
                            } else {
                                methods.showError(file.errors);
                            }

                        });
                        methods.handleEmptyValue();
                        methods.checkInputVisibility();
                        $(document).trigger('upload:done', $input);
                        $input.trigger('upload:done');
                        if (options.done !== undefined) options.done(e, data);
                    },
                    fail: function (e, data) {
                        methods.showError(data.errorThrown);
                        if (options.fail !== undefined) options.fail(e, data);
                    },
                    always: function (e, data) {
                        $container.find('.upload-kit-input').removeClass('in-progress');
                        $input.trigger('always');
                        if (options.always !== undefined) options.always(e, data);
                    }

                });
                if (options.files) {
                    options.files.sort(function(a, b){
                        return parseInt(a.order) - parseInt(b.order);
                    });
                    $fileupload.fileupload('option', 'done').call($fileupload, $.Event('done'), {result: {files: options.files}});
                    methods.handleEmptyValue();
                    methods.checkInputVisibility();
                }
            },
            dragInit: function(){
                $(document).on('dragover', function ()
                {
                    $('.upload-kit-input').addClass('drag-highlight');
                });
                $(document).on('dragleave drop', function ()
                {
                    $('.upload-kit-input').removeClass('drag-highlight');
                });
            },
            showError: function(error){
                if ($.fn.popover) {
                    $container.find('.error-popover').attr('data-content', error).popover({html:true,trigger:"hover"});
                }
                $container.find('.upload-kit-input').addClass('error');
            },
            removeItem: function(e){
                var $this = $(this);
                var url = $this.data('url');
                if (url) {
                    $.ajax({
                        url: url,
                        type: 'DELETE'
                    })
                }
                $this.parents('.upload-kit-item').remove();
                methods.handleEmptyValue();
                methods.checkInputVisibility();
            },
            createItem: function(file){
                var name = options.name;
                var index = methods.getNumberOfFiles();
                if (options.multiple) {
                    name += '[' + index + ']';
                }
                var item = $('<li>', {"class": "upload-kit-item done ",
                    "style": options.alt && options.title ?
                        'margin-bottom: 10rem !important' : options.alt || options.title ?
                        'margin-bottom: 5rem !important' : ''
                    })
                    .append($('<input/>', {"name": name + '[' + options.pathAttributeName + ']', "value": file[options.pathAttribute], "type":"hidden"}))
                    .append($('<input/>', {"name": name + '[name]', "value": file.name, "type":"hidden"}))
                    .append($('<input/>', {"name": name + '[size]', "value": file.size, "type":"hidden"}))
                    .append($('<input/>', {"name": name + '[type]', "value": file.type, "type":"hidden"}))
                    .append($('<input/>', {"name": name + '[order]', "value": file.order, "type":"hidden", "data-role": "order"}))
                    .append($('<input/>', {"name": name + '[' + options.baseUrlAttributeName + ']', "value": file[options.baseUrlAttribute], "type":"hidden"}));
                    if(options.alt) {
                        item.append($('<input/>', {"name": name + '[alt]', "value": file.alt, "class": 'text-options form-control', 'placeholder': 'Alt'}));
                    }
                    if(options.title) {
                        item.append($('<input/>', {"name": name + '[title]', "value": file.title, "class": 'text-options form-control', 'placeholder': 'Title'}));
                    }
                    item.append($('<span/>', {
                        "class": "name",
                        "title": file.name,
                        "text": options.showPreviewFilename ? file.name : null
                    }))
                    .append($('<span/>', {"class": "glyphicon glyphicon-remove-circle remove", "data-url": file.delete_url}));
                if ((!file.type || file.type.search(/image\/.*/g) !== -1) && options.previewImage) {
                    item.removeClass('not-image').addClass('image');
                    item.prepend($('<img/>', {src: file[options.baseUrlAttribute] + '/' +file[options.pathAttribute]}));
                    item.find('span.type').text('');
                } else {
                    item.removeClass('image').addClass('not-image');
                    item.css('backgroundImage', '');
                    item.find('span.name').text(file.name);
                }
                return item;
            },
            checkInputVisibility: function(){
                var inputContainer = $container.find('.upload-kit-input');
                if (options.maxNumberOfFiles && (methods.getNumberOfFiles() >= options.maxNumberOfFiles)) {
                    inputContainer.hide();
                } else {
                    inputContainer.show();
                }
            },
            handleEmptyValue: function(){
                if (methods.getNumberOfFiles() > 0) {
                    $emptyInput.val(methods.getNumberOfFiles())
                } else {
                    $emptyInput.removeAttr('value');
                }
            },
            getNumberOfFiles: function() {
                return $container.find('.files .upload-kit-item').length;
            },
            updateOrder: function () {
                $files.find('.upload-kit-item').each(function(index, item){
                    $(item).find('input[data-role=order]').val(index);
                })
            }
        };

        methods.init.apply(this);
        return this;
    };

})(jQuery);

