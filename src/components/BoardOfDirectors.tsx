import React from 'react';
import { motion } from 'framer-motion';
import { StepWrapper } from './StepWrapper';

interface BoardMember {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
  linkedin?: string;
  twitter?: string;
  contact?: string;
}

const BOARD: BoardMember[] = [
  {
    name: 'Michael Simm',
    title: 'Founder & Chairman',
    bio: 'Michael holds a BA in Political Science with a Minor in Innovation in Society from ASU\'s honors college. During his time at ASU, he published a peer-reviewed paper on how Universal Basic Income could improve the American economy. Inspired by this research, he designed The Logical Foundation to bring about the end of poverty and homelessness. Michael has spearheaded the organization since its inception.',
    imageUrl: 'https://thelogicalfoundation.org/wp-content/uploads/2025/08/Profile-scaled.jpg',
    linkedin: 'https://www.linkedin.com/in/michaelsimm-f',
    twitter: 'https://x.com/MichaelSimm_F',
    contact: 'Michael@thelogicalfoundation.org',
  },
  {
    name: 'Gareth Gilsdorf',
    title: 'Co-Founder',
    bio: 'Gareth owns the business Buckminster LLC, which develops 3D printed ceramics for housing and shipping. He\'s spent most of his life living in rural areas in poverty. Having lived in his own car in Phoenix, he knows firsthand how difficult it can be to not know where to safely eat, sleep, or even use the restroom. He co-founded The Logical Foundation to help tackle homelessness directly. Gareth is responsible for keeping The Logical Foundation on track and true to its mission.',
    imageUrl: 'https://thelogicalfoundation.org/wp-content/uploads/2025/07/Gareth-Close-up.png',
    linkedin: 'https://www.linkedin.com/in/gareth-gilsdorf-913396188/',
  },
  {
    name: 'Carol Farabee',
    title: 'Treasurer',
    bio: 'Carol Farabee is the owner of multiple businesses as well as founder and co-founder of several nonprofits. She currently works with authors through her publishing company as a writing coach and editor. Carol is the best-selling author of \'Marketing through Authorship\'. She is the founder of Young Writers Foundation, mentoring 12 to 19-year-olds in Arizona. With over 30 years experience in Corporate America and 20 years as a University Professor, her credentials include a BA in Sociology, MBA in Management, MS in Systems Engineering, and a PhD(abd) in Applied Management.',
    imageUrl: 'https://thelogicalfoundation.org/wp-content/uploads/2025/07/Carol_Profile.jpg',
    linkedin: 'https://www.linkedin.com/in/carol-farabee-665641b/',
  },
  {
    name: 'Kevin Jackrel',
    title: 'Secretary',
    bio: 'Kevin holds a BS in Political Science from ASU. Having learned about utilitarianism in college, he\'s concerned with how we can produce the greatest good for the greatest number. This philosophy motivates his work at The Logical Foundation because he believes that direct cash transfers are the most effective method for fighting homelessness. He is responsible for marketing, logistics, planning, and outreach.',
    imageUrl: 'https://thelogicalfoundation.org/wp-content/uploads/2025/07/Kevin_Edit_HR-1.jpg',
    linkedin: 'https://www.linkedin.com/in/kevin-jackrel-3b52291b7/',
  },
];



const MemberCard: React.FC<{ member: BoardMember; index: number }> = ({ member, index }) => {
  const bm = member;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="card flex flex-col sm:flex-row gap-5"
    >
      {member.imageUrl && (
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-24 h-24 rounded-2xl object-cover object-top border border-border"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-textPrimary leading-tight">{member.name}</h3>
        <p className="text-accent text-sm font-semibold mb-2">{member.title}</p>
        <p className="text-textSecondary text-sm leading-relaxed mb-3">{member.bio}</p>
        <div className="flex flex-wrap gap-3 text-xs">
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-accent hover:text-accentHover transition-colors font-medium">
              LinkedIn →
            </a>
          )}
          {bm.twitter && (
            <a href={bm.twitter} target="_blank" rel="noopener noreferrer"
              className="text-accent hover:text-accentHover transition-colors font-medium">
              X / Twitter →
            </a>
          )}
          {bm.contact && (
            <a href={`mailto:${bm.contact}`}
              className="text-textMuted hover:text-textPrimary transition-colors">
              {bm.contact}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

interface BoardOfDirectorsProps {
  onBack: () => void;
}

export const BoardOfDirectors: React.FC<BoardOfDirectorsProps> = ({ onBack }) => {
  return (
    <StepWrapper stepKey="board">
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-textMuted hover:text-textPrimary transition-colors text-sm"
          >
            ← Back
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-textPrimary mb-1">Our Team</h2>
          <p className="text-textSecondary text-sm mb-8">
            The people building a future without poverty.
          </p>
        </motion.div>

        {/* Board of Directors */}
        <section className="mb-10">
          <h3 className="text-xs font-semibold text-textMuted uppercase tracking-widest mb-4">
            Board of Directors
          </h3>
          <div className="space-y-4">
            {BOARD.map((member, i) => (
              <MemberCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </section>

        {/* Footer info */}
        <div className="card text-center mb-6">
          <p className="text-textSecondary text-sm mb-1">
            The Logical Foundation is a 501(c)(3) nonprofit organization
          </p>
          <p className="text-textMuted text-xs mb-3">EIN# 88-3607946</p>
          <a href="mailto:info@thelogicalfoundation.org"
            className="text-accent hover:text-accentHover text-sm transition-colors">
            info@thelogicalfoundation.org
          </a>
        </div>

        <button
          onClick={onBack}
          className="btn-secondary w-full"
        >
          ← Back
        </button>
      </div>
    </StepWrapper>
  );
};
