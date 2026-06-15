const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="text-muted-foreground">
        Dernière mise à jour : {new Date().getFullYear()}
      </p>

      <section>
        <h2 className="text-xl font-semibold mb-3">1. Données collectées</h2>
        <p>
          Standing Together collecte uniquement les données nécessaires au
          fonctionnement du service :
        </p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Nom d'affichage</li>
          <li>Adresse email</li>
          <li>Photo de profil (optionnel — via Google OAuth)</li>
          <li>Données de projets et tâches créées par l'utilisateur</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          2. Utilisation des données
        </h2>
        <p>Les données collectées sont utilisées exclusivement pour :</p>
        <ul className="list-disc pl-6 space-y-1 mt-2">
          <li>Authentifier l'utilisateur (JWT stateless)</li>
          <li>Afficher le profil dans l'application</li>
          <li>Gérer les workspaces et les équipes</li>
        </ul>
        <p className="mt-2">
          Aucune donnée n'est vendue ou transmise à des tiers.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          3. Protection des données
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Mots de passe hachés avec bcrypt (salt rounds = 10) — irrecouvrables
            même en cas de compromission de la base
          </li>
          <li>Authentification par JWT — expire après 24 heures</li>
          <li>
            Connexion MongoDB non exposée à Internet — réseau Docker interne
            uniquement
          </li>
          <li>Transport chiffré via HTTPS en production</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">
          4. Vos droits (RGPD — Art. 15 à 22)
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Droit d'accès :</strong> Consultez votre profil dans les
            paramètres
          </li>
          <li>
            <strong>Droit de rectification :</strong> Modifiez votre nom dans la
            page Profil
          </li>
          <li>
            <strong>Droit à l'effacement :</strong> Supprimez votre workspace
            dans Paramètres — toutes vos données sont supprimées en cascade
          </li>
          <li>
            <strong>Droit à la portabilité :</strong> Exportez vos données via
            le rapport Excel (OWNER uniquement)
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
        <p>
          L'application utilise un cookie technique pour mémoriser l'état de la
          sidebar (ouvert/fermé). Ce cookie ne contient aucune donnée
          personnelle et ne nécessite pas de consentement selon l'article 82 de
          la loi Informatique et Libertés.
        </p>
        <p className="mt-2">
          Aucun cookie publicitaire ou de tracking n'est utilisé.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">6. Hébergement</h2>
        <p>
          L'application est auto-hébergée sur un VPS privé. Les données ne
          transitent pas par des services cloud tiers (pas de AWS, Google Cloud,
          ou Azure pour le stockage des données).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
        <p>
          Pour toute question relative à vos données personnelles, contactez
          l'administrateur du service.
        </p>
      </section>
    </div>
  );
};

export default Privacy;
