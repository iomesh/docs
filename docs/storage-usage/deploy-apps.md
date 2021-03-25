---
id: deploy-apps
title: Deploy Apps
sidebar_label: Deploy Apps
---

## Deploy Apps by Deployment

The general steps of deploying Deployment with persistent volumes are shown below:

1. Create a StorageClass with `iomesh-example-sc` as `name`, along with the file system type, number of replicas, and thin-provision mode. For example:

   ```yaml
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: iomesh-example-sc
   provisioner: com.iomesh.csi-driver # driver.name in values.yaml when install IOMesh Cluster
   reclaimPolicy: Retain
   allowVolumeExpansion: true
   parameters:
     csi.storage.k8s.io/fstype: "ext4"
     replicaFactor: "2"
     thinProvision: "true"
   ```

2. Create a PVC with `iomesh-example-sc` as `storageClassName`

   ```yaml
   # iomesh-mysql-pvc.yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: iomesh-example-pvc
   spec:
       storageClassName: iomesh-example-sc
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 10Gi
   ```

3. Use the PVC in deployment

See a read application in [iomesh-for-mysql](http://iomesh.com/docs/stateful-applications/iomesh-for-mysql)
