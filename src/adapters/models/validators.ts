import mongoose from 'mongoose';

mongoose.Schema.Types.String.set('validate', {
    validator: (v: string) => v.trim().length > 0,
    message: ({ path }: { path: string }) => `${path} cannot be empty`,
});
