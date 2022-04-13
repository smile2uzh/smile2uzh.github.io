'use strict';
 
/* globals MediaRecorder */
 
let mediaRecorder;
let recordedBlobs;
 
const errorMsgElement = document.querySelector('span#errorMsg');
const recordedVideo = document.querySelector('video#recorded');
const recordButton = document.querySelector('button#record');
const playButton = document.querySelector('button#play');
const downloadButton = document.querySelector('button#download');

function animate_counter(){
	$('#counter-number').css('display','block');

	function loop(el) {
	    $('#counter-number').text(el);
	    $('#counter-number').animate({
	        fontSize: "7rem"
	    }, {
	        duration: 1000, 
	        easing: 'linear', 
	        complete: function(){
				$('#counter-number').css('fontSize', '0rem')
				if (el > 1){
					el -= 1
					loop(el)
				} else {
					$('#counter-number').css('display','hide');
				}
	        }
	    });
	}
	loop(5);
}
function return_sizes(){
	let width = $('#recorder-container').width();
	let height = $('#modal-body-record').height();

	// let modal = document.querySelector('#carouselExampleIndicators');
	// let style = window.getComputedStyle(modal);
	
	// let width = (parseInt(style.width, 10)-24);
	// let height = parseInt(style.height, 10)/1.5;
	// if (height<width) {
	// 	width /= 2;
	// }
	if (width < 200) {
		width = 200
	}

	return {'width':width, 'height': height}
}

$('#recordModal').on('shown.bs.modal', function () {
	function loadStyle(){
		$('#gum').removeClass("animate-border-gum");
		let recorder = document.querySelector('#recorded');
		let gum = document.querySelector('#gum');
		let sizes = return_sizes();

		recorder.width = sizes.width;
		recorder.height = sizes.height;
		gum.width = sizes.width;
		gum.height = sizes.height;
		document.getElementById('recorded').style.display = 'none';
	}
	setTimeout(loadStyle, 500);
});

recordButton.addEventListener('click', () => {
	document.getElementById('gum').style.display = '';
	document.getElementById('recorded').style.display = 'none';
	if (recordButton.textContent === 'Record') {
		animate_counter();
		var intervalId = window.setTimeout(function(){
			$('#gum').addClass("animate-border-gum");
			startRecording();
		}, 5000);
	} else {
		$('#gum').removeClass("animate-border-gum");
		$('#counter-number').css('display','none');
		stopRecording();
		recordButton.textContent = 'Record';
		playButton.disabled = false;
		downloadButton.disabled = false;
	}
});
 
 
playButton.addEventListener('click', () => {
	document.getElementById('gum').style.display = 'none';
	document.getElementById('recorded').style.display = '';

	const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
	recordedVideo.src = null;
	recordedVideo.srcObject = null;
	recordedVideo.src = window.URL.createObjectURL(superBuffer);
	recordedVideo.controls = true;
	recordedVideo.play();
});
 
 
downloadButton.addEventListener('click', () => {
	const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
	// window.URL.srcObject = blob;
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	let slide_number = $('.carousel-item.active').index();
	a.download = 's'+stufa+'_e'+exercise+'_i'+String(slide_number)+'.mp4';
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	}, 100);
});
 
function handleDataAvailable(event) {
	console.log('handleDataAvailable', event);
	if (event.data && event.data.size > 0) {
		recordedBlobs.push(event.data);
	}
}
 
function startRecording() {
	$('#record-icon').css('display', 'block');
	recordedBlobs = [];
	let options = {mimeType: 'video/webm'};
	try {
		mediaRecorder = new MediaRecorder(window.stream, options);
	} catch (e) {
		console.error('Exception while creating MediaRecorder:', e);
		errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
		return;
	}
 
	console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
	recordButton.textContent = 'Stop Recording';
	playButton.disabled = true;
	downloadButton.disabled = true;
	mediaRecorder.onstop = (event) => {
		console.log('Recorder stopped: ', event);
		console.log('Recorded Blobs: ', recordedBlobs);
	};
	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.start();
	console.log('MediaRecorder started', mediaRecorder);
}
 
function stopRecording() {
	$('#record-icon').css('display', 'none');
	mediaRecorder.stop();
}
function restart_recorder_modal() {
	document.getElementById('gum').style.display = 'none';
	document.getElementById('recorded').style.display = 'none';
	$('#record-icon').css('display', 'none');
	playButton.disabled = true;
	downloadButton.disabled = true;
	recordButton.disabled = true;
}
function handleSuccess(stream) {
	recordButton.disabled = false;
	$('#recordModal').on('hidden.bs.modal', function () {
		recordButton.textContent = 'Record';
		playButton.disabled = false;
		downloadButton.disabled = false;
		$('#record-icon').css('display', 'none');
		stream.getTracks().forEach(function(track) {
			restart_recorder_modal();
			track.stop();
		});
	});
	console.log('getUserMedia() got stream:', stream);
	window.stream = stream;
 
	const gumVideo = document.querySelector('video#gum');
	gumVideo.srcObject = stream;
}
 
async function init(constraints) {
	try {
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		handleSuccess(stream);
	} catch (e) {
		console.error('navigator.getUserMedia error:', e);
		errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
	}
}
 
document.querySelector('button#start').addEventListener('click', async () => {
	document.getElementById('gum').style.display = '';
	document.getElementById('recorded').style.display = 'none';

	let sizes = return_sizes()

	const constraints = {
		video: {
			width: sizes.width,
			height: sizes.height,
			// aspectRatio: { exact: 1 },
			facingMode: "user"
		}
	};
	console.log('Using media constraints:', constraints);
	await init(constraints);
});