# ISCX NestJs API Template

Template for creating ISCX NestJs Apis. This repo is provisioned as a template, so you can use to when your creating a new repository. Here's a link on how to use templates in Github [link](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## Template Contents
The template includes two examples. Both examples include a template api, that you can reuse by editing the name or you can remove it. ``Choose which template you need and remove the other``.
1. ``with-dynamodb-and-ampdb`` - template with both dynamodb and ampdb connection setup
2. ``with-dynamodb`` - template with dynamodb connection setup
3. ``lambda-with-dynamodb`` - nestjs lambda template with dynamodb connection setup
4. ``lambda-with-dynamodb-and-ampdb`` - nestjs lambda template with dynamodb and ampdb connection setup

## What you will need to update after using a template
1. ``package.json`` - Update name and description
2. ``README.md`` - Remove reference to the template and update the swaggerui url
4. Update template query names to match your service. For example ``template.query.ts`` -> ``submission.query.ts``
5. Rename ``template classes`` or remove them
6. Update ``main.ts`` swaggerui ``setTitle`` to your service name

## For lambda updates after using template
1. Follow steps 1 - 6 from the above
2. Update ``appSetup.ts`` swaggerui ``setTitle`` to your service name
3. Update ``serverless.yml`` ``stackName`` to what your service will be called
4. Update ``serverless.yml`` ``apiName`` to what your service will be called
5. Update ``serverless.yml`` ``function name`` to what your service will be called

## Authors

- **ISCx Team**

## License

Copyright (C) Integrated Specialty Coverages, LLC. All Rights Reserved.