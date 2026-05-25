import QRCode from 'qrcode';

export async function gerarQrCodeDataUri(valor) {

  const svg =
    await QRCode.toString(
      valor,
      {
        type: 'svg',
        width: 200,
        margin: 1,
        errorCorrectionLevel: 'M'
      }
    );

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

}
