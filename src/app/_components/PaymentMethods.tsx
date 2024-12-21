import { api } from "~/trpc/react";

function ContactMethodLink(props: {
  sellerInfo: {
    instagram?: string | null;
    phone?: string | null;
    email?: string | null;
  }
}) {
  function formatPhoneNumber(phoneNumberString: string) {
    const regex = new RegExp('^\\+(\\d{3})(\\d{4})(\\d{4})$');
    const match = regex.exec(phoneNumberString);

    if (!match) return null;

    return '+' + match[1] + ' ' + match[2] + ' ' + match[3];
  }

  if (props.sellerInfo.phone) {
    return (
      <a href={`https://wa.me/${props.sellerInfo.phone}`} target="_blank" className="text-blue-500 underline">
        {formatPhoneNumber(props.sellerInfo.phone)}
      </a>
    );
  }

  if (props.sellerInfo.instagram) {
    return (
      <a
        href={`https://instagram.com/${props.sellerInfo.instagram}`} target="_blank" rel="noreferrer"
        className="text-blue-500 underline"
      >
        @{props.sellerInfo.instagram}
      </a>
    );
  }

  if (props.sellerInfo.email) {
    return (
      <a href={`mailto:${props.sellerInfo.email}`} target="_blank" className="text-blue-500 underline">
        {props.sellerInfo.email}
      </a>
    );
  }
}

export function PaymentMethods() {
  const [sellerInfos] = api.user.listSellerInfos.useSuspenseQuery();

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Métodos de pago</h1>
      <div>
        <p>Por ahora solo aceptamos transferencia 😅. Háblale a alguno de nuestros embajadores para comprar tu entrada 🙃:</p>
        <div className="mt-8">
          {sellerInfos.map(sellerInfo => {
            return (
              <div key={sellerInfo.id} className="flex items-center justify-between mt-4">
                <p className="font-semibold">{sellerInfo.user.name}</p>
                <ContactMethodLink sellerInfo={sellerInfo} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
