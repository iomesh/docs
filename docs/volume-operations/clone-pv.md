---
id: clone-pv
title: Clone PV
sidebar_label: Clone PV
---

A clone is a duplicate of an existing volume in the system and data on the source will be duplicated to the destination. To clone a PV, you should create a new PVC and specify an existing PVC in the field `dataSource` so that you can clone a volume based on it.

**Precautions**
- The source PVC and the target PVC must be in the same namespace.
- The source PVC and the target PVC must have the same StorageClass and VolumeMode.
- The capacity value of the target PVC must be the same as that of the source PVC.

**Prerequisite**

Verify that there is already a PVC available for cloning.

**Procedure**
1. Create a YAML config `clone.yaml`. Specify the source PVC in the field `name`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: cloned-pvc
    spec:
      storageClassName: iomesh-csi-driver # The StorageClass must be the same as that of the source PVC.
      dataSource:
        name: existing-pvc # Specify the source PVC that should be from the same namespace as the target PVC. 
        kind: PersistentVolumeClaim
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5Gi # The capacity value must be the same as that of the source volume.
      volumeMode: Block # The volume mode must be the same as that of the source PVC.
    ```

2. Apply the YAML config. Once done, a clone of `existing-pvc` will be created.

    ```bash
    kubectl apply -f clone.yaml
    ``` 
   
3. Check the new PVC.

    ```
    kubectl get pvc cloned-pvc
    ```
   If successful, you should see output below:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    cloned-pvc                                  Bound    pvc-44230f3f-47dc-46e8-8c42-38c073c40598   5Gi        RWO            iomesh-csi-driver   21h   
    ```
4. Get the cloned PV.
    ```shell
    kubectl get pv pvc-44230f3f-47dc-46e8-8c42-38c073c40598 # The PV name you get in Step 3.
    ```

    If successful, you should see output below:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM         STORAGECLASS
    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   5Gi        Delete           Bound    cloned-pvc    iomesh-csi-driver
    ```