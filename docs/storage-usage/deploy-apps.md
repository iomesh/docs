---
id: deploy-apps
title: Deploy Apps
sidebar_label: Deploy Apps
---

## Deploy apps use Deployment

The general steps are as follows:
1. Create the storageclass corresponding to the app, and declare the file system type, number of copies, and thin mode of pv in the storageclass, such as

   ```yaml
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: iomesh-example-sc
   provisioner: <driver.name> # driver.name in values.yaml when install Iomesh Cluster
   reclaimPolicy: Retain
   allowVolumeExpansion: true
   parameters:
     csi.storage.k8s.io/fstype: "ext4"
     replicaFactor: "2"
     thinProvision: "true"
   ```

2. Create PVC, its storageClassName field points to the storageclass created above

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

See a real example in [iomesh-for-mysql](http://iomesh.com/docs/stateful-applications/iomesh-for-mysql)

## Deploy apps use Statefulset

The general steps are as follows:

1. Create the storageclass corresponding to the app, and declare the file system type, number of copies, and thin mode of pv in the storageclass

   ```yaml
   kind: StorageClass
   apiVersion: storage.k8s.io/v1
   metadata:
     name: iomesh-example-sc
   provisioner: <driver.name> # driver.name in values.yaml when install Iomesh Cluster
   reclaimPolicy: Retain
   allowVolumeExpansion: true
   parameters:
     csi.storage.k8s.io/fstype: "ext4"
     replicaFactor: "2"
     thinProvision: "true"
   ```

2. Claim PVC in volumeClaimTemplates field in Statefulset Spec:

```yaml
apiVersion: apps/v1beta1
kind: StatefulSet
# ......
  volumeClaimTemplates:
  - metadata:
      name: example-app-pvc
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: iomesh-example-sc # storageClass created above
      resources:
        requests:
          storage: 10Gi
```

See a real example in [iomesh-for-mongodb](http://iomesh.com/docs/stateful-applications/iomesh-for-mongodb)



## Deploy apps use other controller or Helm

Similar to Deployment and Statefulset. You just need to put the PVC in the right place