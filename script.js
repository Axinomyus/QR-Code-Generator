(function () {
	var $background = document.querySelector('main form [name="background"]');
	var $backgroundAlpha = document.querySelector('main form [name="backgroundAlpha"]');
	var $foreground = document.querySelector('main form [name="foreground"]');
	var $foregroundAlpha = document.querySelector('main form [name="foregroundAlpha"]');
	var $level = document.querySelector('main form [name="level"]');
	var $section = document.querySelector('main section');
	var $padding = document.querySelector('main form [name="padding"]');
	var $size = document.querySelector('main form [name="size"]');
	var $value = document.querySelector('main form [name="value"]');

	var $qrcontainer = document.getElementById("qrImgContainer");

	var qr = window.qr = new QRious({
		element: document.getElementById('qrious'),
		size: 250,
		value: 'https://asocialfingers.com/'
	});

	$background.addEventListener('change', function () {
		qr.background = $background.value || null;
		$qrcontainer.style.background = $background.value || null;
	});

	$backgroundAlpha.addEventListener('change', function () {
		qr.backgroundAlpha = $backgroundAlpha.value || null;
	});

	$foreground.addEventListener('change', function () {
		qr.foreground = $foreground.value || null;
	});

	$foregroundAlpha.addEventListener('change', function () {
		qr.foregroundAlpha = $foregroundAlpha.value || null;
	});

	$level.addEventListener('change', function () {
		qr.level = $level.value;
	});

	$padding.addEventListener('change', function () {
		if ($padding.validity.valid) {
			qr.padding = $padding.value !== '' ? $padding.value : null;
		}
	});

	$size.addEventListener('change', function () {
		if (!$size.validity.valid) {
			return;
		}

		qr.size = $size.value || null;

		$section.style.minWidth = qr.size + 'px';
	});

	$value.value = '';
	$value.addEventListener('input', function () {
		qr.value = $value.value;
	});
})();

document.getElementById("download").addEventListener("click", function() {
	var element = document.getElementById("qrImgContainer");
  
	html2canvas(element, {
	  onrendered: function(canvas) {
		var imageData = canvas.toDataURL("image/png");
		var downloadLink = document.createElement("a");
		downloadLink.href = imageData;
  
		var datetime = new Date().toISOString().replace(/[-:.]/g, "");
		downloadLink.download = "qr-code-generator-aSocial_Fingers-" + datetime + ".png";
  
		downloadLink.click();
	  }
	});
  });
  