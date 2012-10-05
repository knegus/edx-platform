var $body;
var $modal;
var $modalCover;
var $newComponentItem;
var $newComponentStep1;
var $newComponentStep2;

$(document).ready(function() {
    $body = $('body');
    $modal = $('.history-modal');
    $modalCover = $('.modal-cover');
    $newComponentItem = $('.new-component-item');
    $newComponentTypePicker = $('.new-component');
    $newComponentTemplatePickers = $('.new-component-templates');
    $newComponentButton = $('.new-component-button');
    $body.bind('keyup', onKeyUp);

    $('.expand-collapse-icon').bind('click', toggleSubmodules);
    $('.visibility-options').bind('change', setVisibility);

    $('.unit-history ol a').bind('click', showHistoryModal);
    $modal.bind('click', hideModal);
    $modalCover.bind('click', hideHistoryModal);
    $('.assets .upload-button').bind('click', showUploadModal);
    $('.upload-modal .close-button').bind('click', hideModal);
    $('.unit .item-actions .delete-button').bind('click', deleteUnit);
    $('.new-unit-item').bind('click', createNewUnit);
    $('.save-subsection').bind('click', saveSubsection);

    // making the unit list sortable
    $('.sortable-unit-list').sortable();
    $('.sortable-unit-list').disableSelection();
    $('.sortable-unit-list').bind('sortstop', onUnitReordered);
});

// This method only changes the ordering of the child objects in a subsection
function onUnitReordered() {
    var subsection_id = $(this).data('subsection-id');

    var _els = $(this).children('li:.leaf');

    var children = new Array();
    for(var i=0;i<_els.length;i++) {
	el = _els[i];
	children[i] = $(el).data('id');
    }

    // call into server to commit the new order
    $.ajax({
	    url: "/save_item",
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		data:JSON.stringify({ 'id' : subsection_id, 'metadata' : null, 'data': null, 'children' : children})
	});
}

function saveSubsection(e) {
    e.preventDefault();
    
    var id = $(this).data('id');

    // pull all metadata editable fields on page
    var metadata_fields = $('input[data-metadata-name]');
    
    metadata = {};
    for(var i=0; i< metadata_fields.length;i++) {
	el = metadata_fields[i];
	metadata[$(el).data("metadata-name")] = el.value;
    } 

    children =[];

    $.ajax({
	    url: "/save_item",
		type: "POST",
		dataType: "json",
		contentType: "application/json",
		data:JSON.stringify({ 'id' : id, 'metadata' : metadata, 'data': null, 'children' : children}),
		success: function() {
		alert('Your changes have been saved.');
	    },
		error: function() {
		alert('There has been an error while saving your changes.');
	    }
	});
}

function createNewUnit(e) {
    e.preventDefault();

    parent = $(this).data('parent');
    template = $(this).data('template');

    $.post('/clone_item',
	   {'parent_location' : parent,
		   'template' : template,
		   'display_name': 'New Unit',
		   },
	   function(data) {
	       // redirect to the edit page
	       window.location = "/edit/" + data['id'];
	   });
}

function deleteUnit(e) {
    e.preventDefault();

    if(!confirm('Are you sure you wish to delete this item. It cannot be reversed!'))
	return;

    var _li_el = $(this).parents('li.leaf');
    var id = _li_el.data('id');
    
    $.post('/delete_item', 
	   {'id': id, 'delete_children' : true}, 
	   function(data) {
	       _li_el.remove();
	   });
}

function showUploadModal(e) {
    e.preventDefault();
    $('.upload-modal').show();
    $('.file-input').bind('change', startUpload);
    $('.upload-modal .choose-file-button').bind('click', showFileSelectionMenu);
    $modalCover.show();
}

function showFileSelectionMenu(e) {
    e.preventDefault();
    $('.file-input').click();
}

function startUpload(e) {
    $('.upload-modal h1').html('Uploading…');
    $('.upload-modal .file-name').html($('.file-input').val());
    $('.upload-modal .file-chooser').ajaxSubmit({
        beforeSend: resetUploadBar,
        uploadProgress: showUploadFeedback,
        complete: displayFinishedUpload
    });
    $('.upload-modal .choose-file-button').hide();
    $('.upload-modal .progress-bar').removeClass('loaded').show();
}

function resetUploadBar(){
    var percentVal = '0%';
    $('.upload-modal .progress-fill').width(percentVal)
    $('.upload-modal .progress-fill').html(percentVal);
}

function showUploadFeedback(event, position, total, percentComplete) {
    var percentVal = percentComplete + '%';
    $('.upload-modal .progress-fill').width(percentVal);
    $('.upload-modal .progress-fill').html(percentVal);
}

function displayFinishedUpload(xhr) {
    if(xhr.status = 200){
        markAsLoaded();
    }
    $('.upload-modal .progress-fill').html(xhr.responseText);
    $('.upload-modal .choose-file-button').html('Load Another File').show();
}

function markAsLoaded() {
    $('.upload-modal .copy-button').css('display', 'inline-block');
    $('.upload-modal .progress-bar').addClass('loaded');
}    

function hideModal(e) {
    e.preventDefault();
    $('.modal').hide();
    $modalCover.hide();
}

function onKeyUp(e) {
    if(e.which == 87) {
        $body.toggleClass('show-wip');
    }
}

function toggleSubmodules(e) {
    e.preventDefault();
    $(this).toggleClass('expand').toggleClass('collapse');
    $(this).closest('.branch, .window').toggleClass('collapsed');
}

function setVisibility(e) {
    $(this).find('.checked').removeClass('checked');
    $(e.target).closest('.option').addClass('checked');
}

function editComponent(e) {
    e.preventDefault();
    $(this).closest('.xmodule_edit').addClass('editing').find('.component-editor').slideDown(150);
}

function closeComponentEditor(e) {
    e.preventDefault();
    $(this).closest('.xmodule_edit').removeClass('editing').find('.component-editor').slideUp(150);
}


function showHistoryModal(e) {
    e.preventDefault();

    $modal.show();
    $modalCover.show();
}

function hideHistoryModal(e) {
    e.preventDefault();

    $modal.hide();
    $modalCover.hide();
}






